const getData = () => {
  fetch(
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
          e.total_recovered,
          e.new_deaths,
          e.new_cases
        )
      )
    );
};

getData();

// Store newly input keys

function insert2(
  country,
  cases,
  deaths,
  totalRecoverd,
  newDeaths,
  newCases,
  isHeader
) {
  const divElemToAdd = document.createElement("div");
  divElemToAdd.classList.add("flex-table");
  divElemToAdd.classList.add("row");
  divElemToAdd.classList.add("rowgroup");
  if (isHeader) {
    divElemToAdd.setAttribute("id", "tableHeader");
  }
  const isYellow = newCases > 0 ? "yellow" : "";
  const isRed = newDeaths > 0 ? "red" : "";
  divElemToAdd.innerHTML = `
  <div class="flex-row first"  role="cell"><span class="flag-icon flag-icon-ca"></span> ${country}</div>
  <div class="flex-row" role="cell">${cases} </div>
  <div class="flex-row" role="cell">${deaths} </div>
  <div class="flex-row" role="cell">${totalRecoverd} </div>
  <div class="flex-row" id=${isRed} role="cell">${
    isRed || isHeader ? "+" + newDeaths : "0"
  } </div>
  <div class="flex-row ${isYellow}"  role="cell">${
    isYellow || isHeader ? "+" + newCases : "0"
  } </div>
  `;

  document.querySelector("#aliases").append(divElemToAdd);
}

window.addEventListener("DOMContentLoaded", event => {
  insert2(
    "Country",
    "Cases",
    "Deaths",
    "Total recovered",
    "New deaths",
    "New cases",
    true
  );
});
