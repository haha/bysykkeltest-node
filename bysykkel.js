const https = require('https');
const options = {
    headers: {
        'client-name':'havard-origotest'
    }
}

function getStationNameById(id) {
    return new Promise((resolve, reject) => {
        https.get('https://gbfs.urbansharing.com/oslobysykkel.no/station_information.json', options, response => {
            let data = '';
            
            if(response.statusCode !== 200) {
                reject('failed request: ' + response.statusCode);
            }

            response.on('data', chunk => {
                data += chunk;
            });
            response.on('end', () => {
                try {
                    let jsonData = JSON.parse(data);
                    let stations = jsonData['data']['stations'];
                    let foundStation;
                    stations.map(station => {
                        if (station.station_id === id) {
                            foundStation = station;
                        }
                    });
                    if (foundStation) {
                        resolve(foundStation);
                    } else {
                        reject("could not find station on id: " + id);
                    }
                } catch (error) {
                    reject(error);
                }
            });
        }).on('error', error => {
            reject(error);
        });
    });
}

function getStats() {
    return new Promise((resolve, reject) => {
        https.get('https://gbfs.urbansharing.com/oslobysykkel.no/station_status.json', options, response => {
            let data = '';

            if(response.statusCode !== 200) {
                reject('failed request: ' + response.statusCode);
            }

            response.on('data', chunk => {
                data += chunk;
            });
            response.on('end', () => {
                try {
                    let jsonData = JSON.parse(data);
                    resolve(jsonData['data']['stations']);
                } catch (error) {
                    reject(error);
                }
            });
        }).on('error', error => {
            reject(error);
        });
    });
}

getStats().then(response => {
    response.map(station => {
        getStationNameById(station.station_id).then(response => {
            console.log(
                response.name +  
                " -- antall ledige sykkler: " + station.num_bikes_available + 
                " -- antall ledige stativer: " + station.num_docks_available
            );
        }).catch(error => {
            console.log(error);
        });
    })
}).catch(error => {
    console.log(error);
});