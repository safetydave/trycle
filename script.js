Date.prototype.toDDMMYYYYString = function () {
  return isNaN (this) ? 'NaN' :
    [
      this.getDate() > 9 ? this.getDate() : 
        '0' + this.getDate(),
      this.getMonth() > 8 ? this.getMonth() + 1 : 
        '0' +  (this.getMonth() + 1), 
      this.getFullYear()
    ].join('/')};

function calc() {

  $("#outputs").empty();

  var startList = $("#startList").val();
  var endList = $("#endList").val();
  var dataString = $("#trelloJson").val();
  if (dataString == "") {
    return;
  }
  var data = jQuery.parseJSON(dataString);

  if (!data || !data.actions) {
    alert("Doesn't look like valid Trello JSON");
    return;
  }

  var cardUpdates = data.actions.filter(function(el) {
    return el.type == "updateCard"; // also available: "updateList"
  });

  var cardCycles = [];

  cardUpdates.map(function(el) {
    var cid = el.data.card.id;
    if (el.data.listBefore && el.data.listBefore.name == startList) {
      if (!cardCycles[cid]) cardCycles[cid] = {};
      cardCycles[cid].depart = new Date(el.date);
    }
    if (el.data.listAfter && el.data.listAfter.name == endList) {
      if (!cardCycles[cid]) cardCycles[cid] = {};
      cardCycles[cid].arrive = new Date(el.date);
    }
    if (cardCycles[cid]) {
      cardCycles[cid].name = el.data.card.name;
    }
  });

  $("#outputs").append("TSV can be pasted directly into Excel<br/>")
  $("#outputs").append('<textarea id="outputCycles" rows="'
    + Object.keys(cardCycles).length + '" cols="80"></textarea>')

  $("#outputCycles").val("name\tcycle days\topen\tstart\tend\n");

  Object.keys(cardCycles).map(function(k) {
    var val = cardCycles[k];
    var open = "no";
    if (startList != endList && val.depart) {
      if (!val.arrive) {
        val.arrive = new Date();
        open = "yes";
      }
      var cycleTimeRaw = (val.arrive.getTime() - val.depart.getTime())/(24*3600*1000);
      var cycleTime = Math.max(1, Math.ceil(cycleTimeRaw));
      $("#outputCycles").val($("#outputCycles").val()
        + val.name + "\t"
        + cycleTime + "\t"
        + open + "\t"
        + val.depart.toDDMMYYYYString() + "\t"
        + val.arrive.toDDMMYYYYString() + "\n");
    }
    else if (startList == endList && val.arrive) {
      if (!val.depart) {
        val.depart = new Date();
        open = "yes";
      }
      var cycleTimeRaw = (val.depart.getTime() - val.arrive.getTime())/(24*3600*1000);
      var cycleTime = Math.max(1, Math.ceil(cycleTimeRaw));
      $("#outputCycles").val($("#outputCycles").val()
        + val.name + "\t"
        + cycleTime + "\t"
        + open + "\t"
        + val.arrive.toDDMMYYYYString() + "\t"
        + val.depart.toDDMMYYYYString() + "\n");
    }
  });

  //console.log(cardCycles);
  //console.log(cardUpdates);
}
