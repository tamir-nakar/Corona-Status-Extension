const res = fetch(
  "https://coronavirus-monitor.p.rapidapi.com/coronavirus/cases_by_country.php",
  {
    method: "GET",
    headers: {
      "x-rapidapi-host": "coronavirus-monitor.p.rapidapi.com",
      "x-rapidapi-key": "95ecef83a2msh6f7dbf0fc606d0cp10442ejsn10e2bcd7d744"
    }
  }
)
  .then(res => res.json())
  .then(data =>
    data.countries_stat.forEach(e =>
      insert2(
        e.country_name,
        e.cases,
        e.deaths,
        e.region,
        e.total_recovered,
        e.new_deaths,
        e.new_cases,
        e.serious_critical
      )
    )
  );

$(function() {
  get();

  $("#clear").click(function() {
    swalAlert
      .fire({
        title: "Are you sure?",
        text: "You're about do clear your alias list",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "No, cancel!",
        reverseButtons: true
      })
      .then(result => {
        if (result.value) {
          clear();
        } else if (
          /* Read more about handling dismissals below */
          result.dismiss === Swal.DismissReason.cancel
        ) {
        }
      });
  });

  $("#current").click(function(event) {
    chrome.tabs.query({active: true, lastFocusedWindow: true}, function(tabs) {
      if (tabs[0] != null) {
        $("#alias").val(tabs[0].title);
        $("#url").val(tabs[0].url);
      }
      $("#alias").select();
    });
  });

  $("#github").click(function() {
    chrome.tabs.update({
      url: "https://github.com/tamir-nakar/chrome_shortcuts"
    });
    return false;
  });

  // Form submission handler
  $("#new_alias").submit(function(event) {
    var alias = $("#alias").val();
    var url = $("#url").val();

    if (alias == "" || url == "") {
      event.preventDefault();
      alert("You must enter an alias and url...");
      return;
    }

    set(alias, url);
    return false;
  });
});

const swalAlert = Swal.mixin({
  customClass: {
    confirmButton: "button success",
    cancelButton: "button danger"
  },
  buttonsStyling: false
});

// Store newly input keys
function set(alias, url) {
  var obj = {};
  obj[alias] = url;
  chrome.storage.sync.set(obj, function() {
    $("#alias").val("");
    $("#url").val("");
  });
}

chrome.storage.onChanged.addListener(function(changes, namespace) {
  for (key in changes) {
    var storageChange = changes[key];
    if (storageChange.newValue != null) {
      insert(key, storageChange.newValue);
    }
  }
});

// Get keys and display
function get() {
  chrome.storage.sync.get(null, function(obj) {
    for (o in obj) {
      insert(o, obj[o]);
    }
  });
}

function clear(refillObj) {
  chrome.storage.sync.clear(function() {
    if (refillObj) {
      Object.keys(refillObj).forEach(el => set(el, refillObj[el]));
    }
    if (!refillObj) {
      Swal.fire("Success!", "Clear Succedded", "success");
    }
  });
  $("#aliases").html("");
}

function remove(alias) {
  swalAlert
    .fire({
      title: "Are you sure?",
      text: `Delete '${alias}' ?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
      reverseButtons: true
    })
    .then(result => {
      if (result.value) {
        chrome.storage.sync.remove(alias, function() {
          $(`[id='${alias}']`).remove();
        });
        Swal.fire("Success!", `'${alias}' was deleted successfully`, "success");
      } else if (
        /* Read more about handling dismissals below */
        result.dismiss === Swal.DismissReason.cancel
      ) {
      }
    });
}

function handleExportAsync() {
  const d = new Date();
  chrome.storage.sync.get(null, function(obj) {
    downloadObjectAsJson(
      obj,
      `Aliases Backup ${d.getUTCMonth()}/${d.getUTCDate()}/${d.getUTCFullYear()}`
    );
  });
}

function handleImport() {
  try {
    const files = document.getElementById("selectFiles").files;
    if (files.length <= 0) {
      return false;
    }

    var fr = new FileReader();

    fr.onload = function(e) {
      try {
        var result = JSON.parse(e.target.result);
        clear(result);
        Swal.fire("Success!", "Improt process ended successfully", "success");
      } catch {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text:
            "Something went wrong! Please make sure to load an '.smd' file and try again"
        });
      }
    };

    fr.readAsText(files.item(0));
  } catch (e) {}
}

function downloadObjectAsJson(exportObj, exportName) {
  var dataStr =
    "data:text/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(exportObj));
  var downloadAnchorNode = document.createElement("a");
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", exportName + ".smd");
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

function insert(alias, url) {
  const divElemToAdd = document.createElement("div");
  divElemToAdd.classList.add("row");
  divElemToAdd.setAttribute("id", alias);
  divElemToAdd.innerHTML = `<img class='removeBtn' src='img/x-square.svg'><div class='pill alias'>${alias}</div><img class='icon arrow' src='img/arrow_right.svg'><div class='pill url'>${url}</div>`;
  divElemToAdd
    .querySelector(".removeBtn")
    .addEventListener("click", () => remove(alias));

  $("#aliases").append(divElemToAdd);
}

function insert2(a, b, c, d, e, f, g, h) {
  const divElemToAdd = document.createElement("div");
  divElemToAdd.classList.add("flex-table");
  divElemToAdd.classList.add("row");
  divElemToAdd.classList.add("rowgroup");
  divElemToAdd.innerHTML = ` <div class="flex-row first"  role="cell"><span class="flag-icon flag-icon-ca"></span> ${a}</div>
  <div class="flex-row" role="cell">${b} </div>
  <div class="flex-row" role="cell">${c} </div>
  <div class="flex-row" role="cell">${d} </div>
  <div class="flex-row" role="cell">${e} </div>
  <div class="flex-row" role="cell">${f} </div>
  <div class="flex-row" role="cell">${g} </div>
  <div class="flex-row" role="cell">${h} </div>`;

  $("#aliases").append(divElemToAdd);
}

// var _gaq = _gaq || [];
// _gaq.push(["_setAccount", "UA-91305548-1"]);
// _gaq.push(["_trackPageview"]);

// (function() {
//   var ga = document.createElement("script");
//   ga.type = "text/javascript";
//   ga.async = true;
//   ga.src = "https://ssl.google-analytics.com/ga.js";
//   var s = document.getElementsByTagName("script")[0];
//   s.parentNode.insertBefore(ga, s);
// })();

window.addEventListener("DOMContentLoaded", event => {
  insert2(
    "Country",
    "Cases",
    "Deaths",
    "Region",
    "Total recovered",
    "New deaths",
    "New cases",
    "Serious/critical"
  );
});
