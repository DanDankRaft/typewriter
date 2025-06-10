import { EditorView, NodeView } from "prosemirror-view";
import { schema as baseSchema } from "prosemirror-schema-basic";
import { MarkType, NodeType, Schema, Node } from "prosemirror-model";
import { EditorState } from "prosemirror-state";
import { undo, redo, history } from "prosemirror-history";
import { keymap } from "prosemirror-keymap";
import { baseKeymap, toggleMark } from "prosemirror-commands";

class CitationView implements NodeView {
    dom: HTMLElement;
    contentDOM: HTMLElement;
    constructor(node: Node) {
        this.dom = document.createElement("span");
        this.dom.contentEditable = "false";
        this.dom.className = "citation";
        // let shadow = this.dom.attachShadow({ mode: "open" });
        this.contentDOM = this.dom;
        // this.dom.addEventListener("keypress", (event) => {
        //     event.preventDefault();
        // });
    }

    setSelection(anchor: number, head: number, root: Document | ShadowRoot) {
        this.dom.contentEditable = "true";
    }

    deselectNode() {
        this.dom.contentEditable = "false";
    }
}

let schemaNodes = baseSchema.spec.nodes.append({
    citation: {
        content: "text*",
        inline: true,
        group: "inline",
        atom: true,
        isolating: true,
        selectable: true,
        attrs: {
            source: { default: "none" },
            content: { default: "TODO" },
        },
    },
});
const schema = new Schema({
    nodes: schemaNodes,
    marks: baseSchema.spec.marks,
});

let initialEditorstate = EditorState.create({
    schema: schema,
    plugins: [
        history(),
        keymap(baseKeymap),
        keymap({
            "Mod-z": undo,
            "Mod-y": redo,
            "Mod-b": toggleMark(schema.marks.strong),
            "Mod-i": toggleMark(schema.marks.em),
        }),
    ],
});

const editorview = $state({
    view: new EditorView(null, { state: initialEditorstate }),
});

const activeButtons = $state({
    bold: false,
    italic: false,
    header: false,
});

const debugValues = $state({
    cursor: 0,
});

function isMarkActive(state: EditorState, mark: MarkType) {
    if (state.storedMarks) {
        return mark.isInSet(state.storedMarks) !== undefined;
    } else if (state.selection.empty) {
        return mark.isInSet(state.selection.$anchor.marks()) !== undefined;
    } else {
        if (state.selection.$from.marksAcross(state.selection.$to) == null) {
            return false;
        }
        return (
            mark.isInSet(
                state.selection.$from.marksAcross(state.selection.$to),
            ) !== undefined
        );
    }
}

function isNodeType(state: EditorState, nodeType: NodeType) {
    let isheading = state.selection.$anchor.parent.type == nodeType;
    state.selection.content().content.forEach((node) => {
        isheading = node.type.name == "heading" || isheading;
    });

    return isheading;
}

function updateButtons(state: EditorState) {
    activeButtons.bold = isMarkActive(state, state.schema.marks["strong"]);
    activeButtons.italic = isMarkActive(state, state.schema.marks["em"]);
    activeButtons.header = isNodeType(state, state.schema.nodes["heading"]);
}

function initiateView() {
    editorview.view = new EditorView(
        document.getElementById("document-editor"),
        {
            state: initialEditorstate,
            nodeViews: {
                citation(node) {
                    return new CitationView(node);
                },
            },
            dispatchTransaction(transaction) {
                let newState = editorview.view.state.apply(transaction);
                editorview.view.updateState(newState);
                updateButtons(newState);
                debugValues.cursor = editorview.view.state.selection.from;
            },
        },
    );
}

export { editorview, activeButtons, initiateView, schema, debugValues };
