package main

import (
	"context"
	"fmt"
	"os"

	"github.com/TwiN/go-color"

	olddocx "github.com/fumiama/go-docx"
	"github.com/gomutex/godocx"
	"github.com/gomutex/godocx/docx"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

type Node struct {
	Type    string   `json:"type"`
	Content *[]*Node `json:"content"`
	Text    string   `json:"text"`
	Marks   *[]Mark  `json:"marks"`
}

type Mark struct {
	Type string `json:"type"`
}

type Attrs struct {
}

func (a *App) SaveFile(document Node) {

	//pick which file to save

	homedir, err := os.UserHomeDir()
	if err != nil {
		fmt.Println(color.InRed(err.Error()))
		return
	}

	filename, err := runtime.SaveFileDialog(a.ctx, runtime.SaveDialogOptions{
		DefaultDirectory: homedir + "/Documents",
		Filters: []runtime.FileFilter{
			{
				DisplayName: "Word documents (*.docx, *.doc)",
				Pattern:     "*.docx;*.doc",
			},
		},
	})

	if err != nil {
		if err.Error() == "shellItem is nil" {
			fmt.Println(color.InRed("user pressed cancel"))
			return
		}

		fmt.Println(err.Error())
		return
	}

	// w := document.Docx()
	w, err := document.DocxNew()
	if err != nil {
		fmt.Println(err.Error())
		return
	}

	//write to file
	// f, err := os.Create(filename)
	// if err != nil {
	// 	fmt.Println(err.Error())
	// 	return
	// }

	// _, err = w.WriteTo(f)
	// if err != nil {
	// 	fmt.Println(err.Error())
	// 	return
	// }
	// err = f.Close()
	// if err != nil {
	// 	return
	// }

	//write to file
	err = w.SaveTo(filename)
	if err != nil {
		fmt.Println(err.Error())
		return
	}

}

func (n *Node) DocxNew() (*docx.RootDoc, error) {
	document, err := godocx.NewDocument()
	if err != nil {
		fmt.Println(err.Error())
		return nil, err
	}

	n.docxNewInner(document, nil)

	return document, nil
}

func (n *Node) docxNewInner(doc *docx.RootDoc, paragraph *docx.Paragraph) {
	switch n.Type {
	case "paragraph":
		paragraph = doc.AddEmptyParagraph()
	case "heading":
		paragraph, _ = doc.AddHeading("", 1)
	case "doc":
		fmt.Println("creating document")
	case "text":
		if paragraph == nil {
			paragraph = doc.AddEmptyParagraph()
		}
		fmt.Print(n.Text)
		run := paragraph.AddText(n.Text)
		//marks
		if n.Marks != nil {
			for _, mark := range *n.Marks {
				switch mark.Type {
				case "strong":
					run.Bold(true)
				case "em":
					run.Italic(true)
				default:
					fmt.Println("unsupported mark: ", mark.Type)
				}
			}
		}
	default:
		fmt.Println(color.Red, "unsupported node type: ", n.Type)
	}

	if n.Content != nil {
		for _, content := range *n.Content {
			content.docxNewInner(doc, paragraph)
		}
	}
}

func (n *Node) Docx() *olddocx.Docx {
	w := olddocx.New().WithDefaultTheme()

	n.docxInner(w, nil)
	return w

}

func (n *Node) docxInner(w *olddocx.Docx, paragraph *olddocx.Paragraph) {
	switch n.Type {
	case "text":
		if paragraph == nil {
			paragraph = w.AddParagraph()
		}
		fmt.Print(n.Text)
		run := paragraph.AddText(n.Text)

		//marks
		if n.Marks != nil {
			for _, mark := range *n.Marks {
				switch mark.Type {
				case "strong":
					run.Bold()
				case "em":
					run.Italic()
				default:
					fmt.Println("unsupported mark: ", mark.Type)
				}
			}
		}
	case "paragraph":
		paragraph = w.AddParagraph()
	case "heading":
		paragraph = w.AddParagraph().Style("Heading1")
	case "doc":
		fmt.Println("creating document")
	default:
		fmt.Println("unsupported node type: ", n.Type)
	}

	if n.Content != nil {
		for _, content := range *n.Content {
			content.docxInner(w, paragraph)
		}
	}
}

func (n *Node) String() string {
	out := n.Text
	if n.Content != nil {
		for _, content := range *n.Content {
			out += content.String()
		}
	}

	if n.Type == "paragraph" || n.Type == "heading" {
		out += "\n"
	}

	return out
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}
