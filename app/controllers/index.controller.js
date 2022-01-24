const https = require('https'),
      fs = require('fs');

const dateNow = new Date(Date.now() - 10800000),
      weekDay = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];  

function getPromise(url){
    
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            
            let dataJSON = [];
    
            res.on('data', (d) => {
                dataJSON.push(d);
            });
            
            res.on('end', () => {
                resolve(Buffer.concat(dataJSON).toString());
            });

            res.on('error', (e) => {
                reject(e);
            });

        }).on('error', (e) => {
            reject(e);
        });
    });
}

async function makeSynchronousRequestSoccer() {
	try {
		let http_promise = getPromise(process.env.URL_SOCCER),
		    response_body = await http_promise;

        let allGamesSoccer = [],
            dataJSON = JSON.parse(response_body),
            soccerTeams = JSON.parse(process.env.SOCCER_TEAMS);

        for(oneMatch of dataJSON.matches){
            if(oneMatch.datahora >= parseInt(dateNow.getFullYear() + (dateNow.getMonth() < 9 ? '0' + (dateNow.getMonth() + 1) : (dateNow.getMonth() + 1)) + (dateNow.getDate() <= 9 ? '0' + dateNow.getDate() : dateNow.getDate()) + '0000')){
                if(soccerTeams.includes(oneMatch.time1['nome-completo']) || soccerTeams.includes(oneMatch.time2['nome-completo'])){

                    let dateGame = oneMatch.data.split('-');

                    dateGame = new Date(dateGame[0], parseInt(dateGame[1]) - 1, dateGame[2]);

                    let dateGameStr = (dateGame.getDate() <= 9 ? '0' + dateGame.getDate() : dateGame.getDate()) + '-' + (dateGame.getMonth() < 9 ? '0' + (dateGame.getMonth() + 1) : (dateGame.getMonth() + 1));
    
                    allGamesSoccer.push({
                        type: 'soccer',
                        league: oneMatch.competicao,
                        teamHome: oneMatch.time1['nome-completo'],
                        acronymHome: oneMatch.time1.sigla,
                        teamAway: oneMatch.time2['nome-completo'],
                        acronymAway: oneMatch.time2.sigla,
                        date: dateGameStr,
                        dateShow: dateGameStr.replace('-','/'),
                        dateType: dateGame,
                        time: oneMatch.horario,
                        logoHome: oneMatch.time1.brasao,
                        logoAway: oneMatch.time2.brasao
                    }) 
                }
            }
        }

        return allGamesSoccer;

	}
	catch(error) {
		console.log(error);
	}
}

function makeNBA() {
	try {
        let nbaIDGame = JSON.parse(fs.readFileSync('./data/nbaIDGame.json')),
            nbaData = JSON.parse(fs.readFileSync('./data/nbaData.json')),
            allGamesNBA = [],
            rightID = 0;

        for(id = 0; id < nbaIDGame.length; id++){
            if((dateNow.getFullYear() + '-' + (dateNow.getMonth() < 9 ? '0' + (dateNow.getMonth() + 1) : (dateNow.getMonth() + 1) ) + '-' + (dateNow.getDate() <= 9 ? '0' + dateNow.getDate() : dateNow.getDate())) <= nbaIDGame[id]){
                rightID = id;
                break;
            }
        }

        for(id = rightID; id < rightID + 6; id++){
            for(oneGame of nbaData.leagueSchedule.gameDates[id].games){
                if(oneGame.broadcasters.intlTvBroadcasters.length != 0){

                    let dateGame = new Date(new Date(oneGame.gameDateTimeUTC).getTime() - 10800000),
                        dateGameStr = (dateGame.getDate() <= 9 ? '0' + dateGame.getDate() : dateGame.getDate()) + '-' + (dateGame.getMonth() < 9 ? '0' + (dateGame.getMonth() + 1) : (dateGame.getMonth() + 1));

                    allGamesNBA.push({
                        type: 'nba',
                        league: 'NBA',
                        teamHome: oneGame.homeTeam.teamName,
                        acronymHome: oneGame.homeTeam.teamTricode,
                        teamAway: oneGame.awayTeam.teamName,
                        acronymAway: oneGame.awayTeam.teamTricode,
                        date: dateGameStr,
                        dateShow: dateGameStr.replace('-','/'),
                        dateType: dateGame,
                        time: (dateGame.getHours() <= 9 ? '0' + dateGame.getHours() : dateGame.getHours()) + 'h' + (dateGame.getMinutes() <= 9 ? '0' + dateGame.getMinutes() : dateGame.getMinutes()),
                        logoHome: 'https://cdn.nba.com/logos/nba/' + oneGame.homeTeam.teamId + '/global/L/logo.svg',
                        logoAway: 'https://cdn.nba.com/logos/nba/' + oneGame.awayTeam.teamId + '/global/L/logo.svg',
                    }) 
                }
            }
        } 

        return allGamesNBA;

	}
	catch(error) {
		console.log(error);
	}
}

async function updateNBA(){
    try{
        let http_promise = getPromise(process.env.URL_NBA),
            response_body = await http_promise;
    
        let nbaData = JSON.parse(response_body),
            nbaIDGame = [],
            auxDate = '';
        
        for(id = 0; id < nbaData.leagueSchedule.gameDates.length; id++){
            auxDate = nbaData.leagueSchedule.gameDates[id].gameDate.split(' ')[0].split('/');
            nbaIDGame.push(auxDate[2] + '-' + (auxDate[0].length == 1 ? '0' + auxDate[0]: auxDate[0]) + '-' + (auxDate[1].length == 1 ? '0' + auxDate[1]: auxDate[1]));
        }
        
        fs.writeFileSync('./data/nbaData.json', response_body);
        fs.writeFileSync('./data/nbaIDGame.json', JSON.stringify(nbaIDGame));
    }
    catch(error){
        console.log(error);
    }
}

module.exports = {
	get: (req, res) => {
 
        (async function () {

            console.log(dateNow)
            console.log(dateNow.getDate())
            console.log(dateNow.getHours())

            let gamesNow = [],
                gamesDate = [],
                auxDate;

            gamesNow = gamesNow.concat(await makeSynchronousRequestSoccer());
            gamesNow = gamesNow.concat(makeNBA());
            
            for(day = 0; day < 7; day++){
                auxDate = new Date(dateNow.getFullYear(), dateNow.getMonth(), dateNow.getDate() + day);
                console.log(auxDate)
                gamesDate.push({
                    dateShow: (auxDate.getDate() <= 9 ? '0' + auxDate.getDate() : auxDate.getDate()) + '/' + (auxDate.getMonth() < 9 ? '0' + (auxDate.getMonth() + 1) : (auxDate.getMonth() + 1)),
                    date: (auxDate.getDate() <= 9 ? '0' + auxDate.getDate() : auxDate.getDate()) + '-' + (auxDate.getMonth() < 9 ? '0' + (auxDate.getMonth() + 1) : (auxDate.getMonth() + 1)),
                    weekDay: weekDay[auxDate.getDay()],
                })
            }

            res.render('index', {gamesNow: gamesNow.sort((a, b) => a.dateType - b.dateType), gamesDate});

        })();
    },
    getUpdate: (req, res) => {

        if(req.params.secretKey == process.env.SECRET_KEY){
            (async function () {
    
                await updateNBA();
    
                res.end('updated');

            })();
        }
        else{
            res.end('fail');
        }

    }
}  

//nfl1: 'https://fcast.espncdn.com/FastcastService/pubsub/profiles/12000/topic/event-football-nfl/message/2428889/checkpoint',
//nfl2: 'https://api.foxsports.com/bifrost/v1/nfl/league/scores-segment/dp?apikey=jE7yBJVRNAwdDesMgTzTXUUSx1It41Fq',