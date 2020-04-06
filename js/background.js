let cachedResults = null;

chrome.runtime.onMessage.addListener((msg, sender, response) => {

    switch (msg.type) {
        case ('provide_data'):

            response(cachedResults);
            break;


    }
});

async function getDataAsync() {
    console.log('fetching new data');
    let res = await fetch(
        "https://coronavirus-monitor.p.rapidapi.com/coronavirus/cases_by_country.php",
        {
            method: "GET",
            headers: {
                "x-rapidapi-host": "coronavirus-monitor.p.rapidapi.com",
                "x-rapidapi-key": "95ecef83a2msh6f7dbf0fc606d0cp10442ejsn10e2bcd7d744"
            }
        }
    );
    res = await res.json();
    cachedResults = res;
}

getDataAsync();
setInterval(async () => getDataAsync(), 30000);

