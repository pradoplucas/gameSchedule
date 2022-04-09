const https = require('https')

const dateNow = new Date(Date.now() - 10800000),
      weekDay = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];  

function mountDateUTC(year, month, day){
    return (year.toString() + '-' + (month < 9 ? '0' + (month + 1) : (month + 1).toString()) + '-' + (day <= 9 ? '0' + day : day.toString()))
}

function mountDayMonth(day, month){
    return ((day <= 9 ? '0' + day : day.toString()) + '-' + (month < 9 ? '0' + (month + 1) : (month + 1).toString()))
}

function mountHour(hour, minute){
    return (hour <= 9 ? '0' + hour : hour.toString()) + 'h' + (minute <= 9 ? '0' + minute : minute.toString())
}

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

async function makeSoccer() {
	try {

        let dataJSON = JSON.parse(await getPromise(process.env.URL_SOCCER)),
            allGamesSoccer = [],
            soccerTeams = JSON.parse(process.env.SOCCER_TEAMS);

        for(oneMatch of dataJSON.matches){
            if(oneMatch.datahora >= parseInt(dateNow.getFullYear() + (dateNow.getMonth() < 9 ? '0' + (dateNow.getMonth() + 1) : (dateNow.getMonth() + 1)) + (dateNow.getDate() <= 9 ? '0' + dateNow.getDate() : dateNow.getDate()) + '0000')){
                if(soccerTeams.includes(oneMatch.time1['nome-completo']) || soccerTeams.includes(oneMatch.time2['nome-completo'])){

                    let dateGame = oneMatch.data.split('-');

                    dateGame = new Date(dateGame[0], parseInt(dateGame[1]) - 1, dateGame[2], parseInt(oneMatch.horario.split('h')[0]), parseInt(oneMatch.horario.split('h')[1]), 0, 0);

                    let dateGameStr = mountDayMonth(dateGame.getDate(), dateGame.getMonth());
    
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

async function makeNBA() {

    try{
        let nbaData = JSON.parse(await getPromise(process.env.URL_NBA)),
            dateNowStr = mountDateUTC(dateNow.getFullYear(), dateNow.getMonth(), dateNow.getDate()),
            allGamesNBA = [],
            dateCount = 0
        
        try{

            for(let oneGameDate of nbaData.leagueSchedule.gameDates){

                let auxDate = oneGameDate.gameDate.split(' ')[0].split('/');
            
                if(dateNowStr <= mountDateUTC(parseInt(auxDate[2]), parseInt(auxDate[0]) - 1, parseInt(auxDate[1]))){
        
                    for(let oneGame of oneGameDate.games){
                        if(oneGame.broadcasters.intlTvBroadcasters.length != 0){
        
                            let dateGame = new Date(new Date(oneGame.gameDateTimeUTC).getTime() - 10800000),
                                dateGameStr = mountDayMonth(dateGame.getDate(), dateGame.getMonth());
        
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
                                time: mountHour(dateGame.getHours(), dateGame.getMinutes()),
                                logoHome: 'https://cdn.nba.com/logos/nba/' + oneGame.homeTeam.teamId + '/global/L/logo.svg',
                                logoAway: 'https://cdn.nba.com/logos/nba/' + oneGame.awayTeam.teamId + '/global/L/logo.svg',
                            }) 
                        }
                    }
    
                    dateCount++
    
                    if(dateCount == 7) break
    
                }
            }
        }
        catch(err){
            console.log(err)
        }
      

        return allGamesNBA;

	}
	catch(error) {
		console.log(error);
	}
}

module.exports = {
	get: (req, res) => {
 
        (async function () {

            let gamesNow = [],
                gamesDate = []

            gamesNow = gamesNow.concat(await makeSoccer());
            gamesNow = gamesNow.concat(await makeNBA());
            
            for(day = 0; day < 7; day++){
                let auxDate = new Date(dateNow.getFullYear(), dateNow.getMonth(), dateNow.getDate() + day);
                let auxDateStr = mountDayMonth(auxDate.getDate(), auxDate.getMonth())
                gamesDate.push({
                    date: auxDateStr,
                    dateShow: auxDateStr.replace('-','/'),
                    weekDay: weekDay[auxDate.getDay()],
                })
            }

            res.render('index', {gamesNow: gamesNow.sort((a, b) => a.dateType - b.dateType), gamesDate});

        })();
    }
}