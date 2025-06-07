export class CitationDB {}

export class Citation {
  content = "";
}

let source = {
  parties: "United States v. MacDonald",
  shorthandParties: "MacDonald", //can be computed
  reporter: {
    volume: "531",
    name: "F.2d",
  },
  firstPage: "196",
  year: "1976",
  court: "4th Cir.",
  subseqHistory: {
    //optional
    action: "rev'd",
    source: {
      reporter: {
        volume: "435",
        name: "U.S.",
      },
      firstPage: "850",
      year: "1978",
      court: "", //special case for SCOTUS, leave blank!
      //no subseqHistory for a subseqHistory source!
    },
  },
};

let citation = {
  signal: "", //optional
  source: source,
  pincite: "199-200",
  //optional
  parenthetical:
    "resting review of the dispositive issue on the principle of judicial economy",
};

function render(citation) {
  //if citation.signal != "" || citation.signal != null
  //  <i>
  //  citation.signal -- TODO: figure out if the citation comes at the beginning of a sentenec ot figure out if it should be uppercase or lowercase.
  //  </i>
  //<i>
  //source.parties
  //","
  //</i>
  //" "
  //source.reporter.volume
  //" "
  //source.reporter.name
  //" "
  //source.firstPage
  //", "
  //citation.pincite
  //" ("
  //source.court
  //" "
  //source.year
  //") "
  //if parenthetical
  //  " ("
  //  citation.parenthetical
  //  ")
  //if source.subseqHistory
  //  ", "
  //  <i>source.subseqHistory.action","</i>" "
  //  source.subseqHistory.source
  //". "
}
