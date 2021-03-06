let cache = null;
let filtered = null;

const getDataAsync = async () => {
  let res = await fetch(
    "https://coronavirus-monitor.p.rapidapi.com/coronavirus/cases_by_country.php",
    {
      method: "GET",
      headers: {
        "x-rapidapi-host": "coronavirus-monitor.p.rapidapi.com",
        "x-rapidapi-key": "95ecef83a2msh6f7dbf0fc606d0cp10442ejsn10e2bcd7d744",
      },
    }
  );
  if (res.status === 200) {
    res = await res.json();
    cache = res;
    return res;
  } else {
    throw new Error("fetch failed");
  }
};

function renderData(data) {
  data.countries_stat.forEach((e, idx) =>
    insert2(
      idx + 1,
      e.country_name,
      e.cases,
      e.deaths,
      e.total_recovered,
      e.new_deaths,
      e.new_cases
    )
  );
}

function clearTable() {
  const e = document.querySelector("#aliases");
  Array.from(e.children).forEach((a) => {
    if (!a.hasAttribute("id", "total") && !a.hasAttribute("id", "tableHeader"))
      e.removeChild(a);
  });
}
async function setCountryLoc(country, loc) {
  await setKeyToStorageAsync(country, loc);
}

async function getCountryLoc(country) {
  const data = await getKeyFromStorageAsync(country);
  return data;
}

function getKeyFromStorageAsync(key) {
  return new Promise((res, rej) => {
    chrome.storage.sync.get([key], function (result) {
      res(result[key]);
    });
  });
}

function setKeyToStorageAsync(key, value) {
  return new Promise((res, rej) => {
    chrome.storage.sync.set({[key]: value}, function () {
      res();
    });
  });
}

(async function init() {
  try {
    const data = await getDataAsync();
    afterFetchHandler();
    renderData(data);

    sortBy("cases");
  } catch {
    const anchor = document.querySelector("#aliases");

    const p = document.createElement("p");
    p.innerText =
      "Oops! it seems like we currently have some difficulties providing data. Please try again in a while.";
    const div = document.createElement("div");
    div.setAttribute("align", "center");
    div.appendChild(p);

    anchor.appendChild(div);
  }
})();

function calculateTotal(data) {
  const sum = (cat) =>
    data.reduce(
      (acc, curr) => acc + parseInt(curr[cat].replace(",", "")) || 0,
      0
    );
  return {
    country_name: "TOTAL",
    cases: sum("cases"),
    deaths: sum("deaths"),
    total_recovered: sum("total_recovered"),
    new_deaths: sum("new_deaths"),
    new_cases: sum("new_cases"),
  };
}

// Store newly input keys

function insert2(
  idx,
  country,
  cases,
  deaths,
  totalRecoverd,
  newDeaths,
  newCases,
  isHeader,
  isTotal
) {
  const anchor = document.querySelector("#aliases");
  const divElemToAdd = document.createElement("div");
  divElemToAdd.classList.add("flex-table");
  divElemToAdd.classList.add("row");
  divElemToAdd.classList.add("rowgroup");
  let isHeaderSorted = "";
  let isSortable = "";
  if (isHeader) {
    divElemToAdd.setAttribute("id", "tableHeader");
    isHeaderSorted = "sorted";
    isSortable = "sortable";
  }

  if (isTotal) {
    divElemToAdd.setAttribute("id", "total");
  }
  const isYellow =
    parseInt(!isTotal && newCases.replace(",", "")) > 0 ? "yellow" : "";
  const isRed =
    parseInt(!isTotal && newDeaths.replace(",", "")) > 0 ? "red" : "";
  divElemToAdd.innerHTML = `
  <div class="flex-row" role="cell">${idx} </div>
  <div class="flex-row first"  role="cell"><span class="flag-icon flag-icon-ca"></span> ${country}</div>
  <div id='cases' class="flex-row ${isHeaderSorted} ${isSortable}" role="cell" >${cases} </div>
  <div id='deaths' class="flex-row ${isSortable}" role="cell">${deaths} </div>
  <div id='totalRecoverd' class="flex-row ${isSortable}" role="cell">${
    totalRecoverd === "N/A" ? 0 : totalRecoverd
  } </div>
  <div id='newDeaths' class="flex-row ${isRed} ${isSortable}"  role="cell">${
    isRed || isHeader || isTotal ? "+" + newDeaths : "0"
  } </div>
  <div id='newCases' class="flex-row ${isYellow} ${isSortable}"  role="cell">${
    isYellow || isHeader || isTotal ? "+" + newCases : "0"
  } </div>
  `;
  // if (isTotal) {
  //   anchor.insertBefore(divElemToAdd, anchor.childNodes[1]);
  // }
  anchor.append(divElemToAdd);
  if (!isHeader) {
    //setTimeout((country, loc) => setCountryLoc(country, loc), 3000);
  }
}

function sortBy(pred) {
  const dataToSort = filtered ? filtered : cache;
  if (dataToSort) {
    clearTable();
    dataToSort.countries_stat.sort((a, b) => {
      if (
        parseInt(a[pred].replace(",", "").replace("+", "")) >=
        parseInt(b[pred].replace(",", "").replace("+", ""))
      ) {
        return -1;
      } else {
        return 1;
      }
    });
  }

  renderData(dataToSort);
}

function filter(str) {
  clearTable();

  let temp = cache.countries_stat.filter(
    (e) =>
      e.country_name.toLowerCase().substring(0, str.length) ===
      str.toLowerCase()
  );

  filtered = {countries_stat: temp};
  renderData(filtered);
}

function clearSorted() {
  document.querySelector("#cases").classList.remove("sorted");
  document.querySelector("#deaths").classList.remove("sorted");
  document.querySelector("#totalRecoverd").classList.remove("sorted");
  document.querySelector("#newDeaths").classList.remove("sorted");
  document.querySelector("#newCases").classList.remove("sorted");
}
function afterFetchHandler() {
  document.querySelector(".lds-hourglass").style.display = "none";
  insert2(
    "",
    "Country",
    "Cases",
    "Deaths",
    "Total recovered",
    "New deaths",
    "New cases",
    true
  );

  const total = calculateTotal(cache.countries_stat);
  insert2(
    "-",
    total.country_name,
    numberWithCommas(total.cases),
    numberWithCommas(total.deaths),
    numberWithCommas(total.total_recovered),
    numberWithCommas(total.new_deaths),
    numberWithCommas(total.new_cases),
    false,
    true
  );
  addHeaderEvents();
}

function addHeaderEvents() {
  document.querySelector("#cases").addEventListener("click", () => {
    clearSorted();
    sortBy("cases");
    document.querySelector("#cases").classList.add("sorted");
  });

  document.querySelector("#deaths").addEventListener("click", () => {
    clearSorted();

    sortBy("deaths");
    document.querySelector("#deaths").classList.add("sorted");
  });

  document.querySelector("#totalRecoverd").addEventListener("click", () => {
    clearSorted();

    sortBy("total_recovered");
    document.querySelector("#totalRecoverd").classList.add("sorted");
  });

  document.querySelector("#newDeaths").addEventListener("click", () => {
    clearSorted();

    sortBy("new_deaths");
    document.querySelector("#newDeaths").classList.add("sorted");
  });

  document.querySelector("#newCases").addEventListener("click", () => {
    clearSorted();

    sortBy("new_cases");
    document.querySelector("#newCases").classList.add("sorted");
  });
}
window.addEventListener("DOMContentLoaded", (event) => {
  document.querySelector("#filter").addEventListener("input", (e) => {
    filter(e.target.value);
  });
});

var _gaq = _gaq || [];
_gaq.push(["_setAccount", "UA-162886524-1"]);
_gaq.push(["_trackPageview"]);

(function () {
  var ga = document.createElement("script");
  ga.type = "text/javascript";
  ga.async = true;
  ga.src = "https://ssl.google-analytics.com/ga.js";
  var s = document.getElementsByTagName("script")[0];
  s.parentNode.insertBefore(ga, s);
})();

function numberWithCommas(x) {
  x = x.toString();
  var pattern = /(-?\d+)(\d{3})/;
  while (pattern.test(x)) x = x.replace(pattern, "$1,$2");
  return x;
}
