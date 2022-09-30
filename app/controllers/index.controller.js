const https = require('https')

const fs = require('fs')

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
                        color: 'lime',
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
                        logoAway: oneMatch.time2.brasao,
                        transmission: oneMatch.estadio,
                        situation: oneMatch.fase + ' ' + oneMatch.rodada
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
                                color: 'orange',
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
                                transmission: oneGame.broadcasters.intlTvBroadcasters.map(value => ' ' + value.broadcasterDisplay),
                                situation: oneGame.seriesGameNumber
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

function makeF1(){
    
    let allInfo = [{"isF1":true,"type":"f1","league":"F1","name":"GP da Emília-Romanha","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_SanMarino_2-300x100.jpg","date":"22-04","dateShow":"22/04","dateType":"2022-04-22T11:30:00.000Z","time":"08h30","situation":"Treino Livre 1"},{"isF1":true,"type":"f1","league":"F1","name":"GP da Emília-Romanha","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_SanMarino_2-300x100.jpg","date":"22-04","dateShow":"22/04","dateType":"2022-04-22T15:00:00.000Z","time":"12h","situation":"Qualificação"},{"isF1":true,"type":"f1","league":"F1","name":"GP da Emília-Romanha","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_SanMarino_2-300x100.jpg","date":"23-04","dateShow":"23/04","dateType":"2022-04-23T10:30:00.000Z","time":"07h30","situation":"Treino Livre 2"},{"isF1":true,"type":"f1","league":"F1","name":"GP da Emília-Romanha","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_SanMarino_2-300x100.jpg","date":"23-04","dateShow":"23/04","dateType":"2022-04-23T14:30:00.000Z","time":"11h30","situation":"Sprint"},{"isF1":true,"type":"f1","league":"F1","name":"GP da Emília-Romanha","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_SanMarino_2-300x100.jpg","date":"24-04","dateShow":"24/04","dateType":"2022-04-24T13:00:00.000Z","time":"10h","situation":"Corrida"},{"isF1":true,"type":"f1","league":"F1","name":"GP de Miami","logo":"https://www.grandepremio.com.br/wp-content/uploads/2021/12/Circuitos_F1_Miami_1-300x100.jpg","date":"06-05","dateShow":"06/05","dateType":"2022-05-06T18:30:00.000Z","time":"15h30","situation":"Treino Livre 1"},{"isF1":true,"type":"f1","league":"F1","name":"GP de Miami","logo":"https://www.grandepremio.com.br/wp-content/uploads/2021/12/Circuitos_F1_Miami_1-300x100.jpg","date":"06-05","dateShow":"06/05","dateType":"2022-05-06T21:30:00.000Z","time":"18h30","situation":"Treino Livre 2"},{"isF1":true,"type":"f1","league":"F1","name":"GP de Miami","logo":"https://www.grandepremio.com.br/wp-content/uploads/2021/12/Circuitos_F1_Miami_1-300x100.jpg","date":"07-05","dateShow":"07/05","dateType":"2022-05-07T17:00:00.000Z","time":"14h","situation":"Treino Livre 3"},{"isF1":true,"type":"f1","league":"F1","name":"GP de Miami","logo":"https://www.grandepremio.com.br/wp-content/uploads/2021/12/Circuitos_F1_Miami_1-300x100.jpg","date":"07-05","dateShow":"07/05","dateType":"2022-05-07T20:00:00.000Z","time":"17h","situation":"Qualificação"},{"isF1":true,"type":"f1","league":"F1","name":"GP de Miami","logo":"https://www.grandepremio.com.br/wp-content/uploads/2021/12/Circuitos_F1_Miami_1-300x100.jpg","date":"08-05","dateShow":"08/05","dateType":"2022-05-08T19:30:00.000Z","time":"16h30","situation":"Corrida"},{"isF1":true,"type":"f1","league":"F1","name":"GP da Espanha","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_Barcelona_3-1-300x100.jpg","date":"20-05","dateShow":"20/05","dateType":"2022-05-20T12:00:00.000Z","time":"09h","situation":"Treino Livre 1"},{"isF1":true,"type":"f1","league":"F1","name":"GP da Espanha","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_Barcelona_3-1-300x100.jpg","date":"20-05","dateShow":"20/05","dateType":"2022-05-20T15:00:00.000Z","time":"12h","situation":"Treino Livre 2"},{"isF1":true,"type":"f1","league":"F1","name":"GP da Espanha","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_Barcelona_3-1-300x100.jpg","date":"21-05","dateShow":"21/05","dateType":"2022-05-21T11:00:00.000Z","time":"08h","situation":"Treino Livre 3"},{"isF1":true,"type":"f1","league":"F1","name":"GP da Espanha","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_Barcelona_3-1-300x100.jpg","date":"21-05","dateShow":"21/05","dateType":"2022-05-21T14:00:00.000Z","time":"11h","situation":"Qualificação"},{"isF1":true,"type":"f1","league":"F1","name":"GP da Espanha","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_Barcelona_3-1-300x100.jpg","date":"22-05","dateShow":"22/05","dateType":"2022-05-22T13:00:00.000Z","time":"10h","situation":"Corrida"},{"isF1":true,"type":"f1","league":"F1","name":"GP de Mônaco","logo":"https://www.grandepremio.com.br/wp-content/uploads/2021/01/Circuitos_F1_Monaco_1-300x100.jpg","date":"27-05","dateShow":"27/05","dateType":"2022-05-27T12:00:00.000Z","time":"09h","situation":"Treino Livre 1"},{"isF1":true,"type":"f1","league":"F1","name":"GP de Mônaco","logo":"https://www.grandepremio.com.br/wp-content/uploads/2021/01/Circuitos_F1_Monaco_1-300x100.jpg","date":"27-05","dateShow":"27/05","dateType":"2022-05-27T15:00:00.000Z","time":"12h","situation":"Treino Livre 2"},{"isF1":true,"type":"f1","league":"F1","name":"GP de Mônaco","logo":"https://www.grandepremio.com.br/wp-content/uploads/2021/01/Circuitos_F1_Monaco_1-300x100.jpg","date":"28-05","dateShow":"28/05","dateType":"2022-05-28T11:00:00.000Z","time":"08h","situation":"Treino Livre 3"},{"isF1":true,"type":"f1","league":"F1","name":"GP de Mônaco","logo":"https://www.grandepremio.com.br/wp-content/uploads/2021/01/Circuitos_F1_Monaco_1-300x100.jpg","date":"28-05","dateShow":"28/05","dateType":"2022-05-28T14:00:00.000Z","time":"11h","situation":"Qualificação"},{"isF1":true,"type":"f1","league":"F1","name":"GP de Mônaco","logo":"https://www.grandepremio.com.br/wp-content/uploads/2021/01/Circuitos_F1_Monaco_1-300x100.jpg","date":"29-05","dateShow":"29/05","dateType":"2022-05-29T13:00:00.000Z","time":"10h","situation":"Corrida"},{"isF1":true,"type":"f1","league":"F1","name":"GP do Azerbaijão","logo":"https://www.grandepremio.com.br/wp-content/uploads/2021/01/Circuitos_F1_Azerbaijao_1-300x100.jpg","date":"10-06","dateShow":"10/06","dateType":"2022-06-10T12:00:00.000Z","time":"09h","situation":"Treino Livre 1"},{"isF1":true,"type":"f1","league":"F1","name":"GP do Azerbaijão","logo":"https://www.grandepremio.com.br/wp-content/uploads/2021/01/Circuitos_F1_Azerbaijao_1-300x100.jpg","date":"10-06","dateShow":"10/06","dateType":"2022-06-10T15:00:00.000Z","time":"12h","situation":"Treino Livre 2"},{"isF1":true,"type":"f1","league":"F1","name":"GP do Azerbaijão","logo":"https://www.grandepremio.com.br/wp-content/uploads/2021/01/Circuitos_F1_Azerbaijao_1-300x100.jpg","date":"11-06","dateShow":"11/06","dateType":"2022-06-11T11:00:00.000Z","time":"08h","situation":"Treino Livre 3"},{"isF1":true,"type":"f1","league":"F1","name":"GP do Azerbaijão","logo":"https://www.grandepremio.com.br/wp-content/uploads/2021/01/Circuitos_F1_Azerbaijao_1-300x100.jpg","date":"11-06","dateShow":"11/06","dateType":"2022-06-11T14:00:00.000Z","time":"11h","situation":"Qualificação"},{"isF1":true,"type":"f1","league":"F1","name":"GP do Azerbaijão","logo":"https://www.grandepremio.com.br/wp-content/uploads/2021/01/Circuitos_F1_Azerbaijao_1-300x100.jpg","date":"12-06","dateShow":"12/06","dateType":"2022-06-12T11:00:00.000Z","time":"08h","situation":"Corrida"},{"isF1":true,"type":"f1","league":"F1","name":"GP do Canadá","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_GillesVilleneuve_2-1-300x100.jpg","date":"17-06","dateShow":"17/06","dateType":"2022-06-17T18:00:00.000Z","time":"15h","situation":"Treino Livre 1"},{"isF1":true,"type":"f1","league":"F1","name":"GP do Canadá","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_GillesVilleneuve_2-1-300x100.jpg","date":"17-06","dateShow":"17/06","dateType":"2022-06-17T21:00:00.000Z","time":"18h","situation":"Treino Livre 2"},{"isF1":true,"type":"f1","league":"F1","name":"GP do Canadá","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_GillesVilleneuve_2-1-300x100.jpg","date":"18-06","dateShow":"18/06","dateType":"2022-06-18T17:00:00.000Z","time":"14h","situation":"Treino Livre 3"},{"isF1":true,"type":"f1","league":"F1","name":"GP do Canadá","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_GillesVilleneuve_2-1-300x100.jpg","date":"18-06","dateShow":"18/06","dateType":"2022-06-18T20:00:00.000Z","time":"17h","situation":"Qualificação"},{"isF1":true,"type":"f1","league":"F1","name":"GP do Canadá","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_GillesVilleneuve_2-1-300x100.jpg","date":"19-06","dateShow":"19/06","dateType":"2022-06-19T18:00:00.000Z","time":"15h","situation":"Corrida"},{"isF1":true,"type":"f1","league":"F1","name":"GP da Inglaterra","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_Siverstone_3-300x100.jpg","date":"01-07","dateShow":"01/07","dateType":"2022-07-01T12:00:00.000Z","time":"09h","situation":"Treino Livre 1"},{"isF1":true,"type":"f1","league":"F1","name":"GP da Inglaterra","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_Siverstone_3-300x100.jpg","date":"01-07","dateShow":"01/07","dateType":"2022-07-01T15:00:00.000Z","time":"12h","situation":"Treino Livre 2"},{"isF1":true,"type":"f1","league":"F1","name":"GP da Inglaterra","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_Siverstone_3-300x100.jpg","date":"02-07","dateShow":"02/07","dateType":"2022-07-02T11:00:00.000Z","time":"08h","situation":"Treino Livre 3"},{"isF1":true,"type":"f1","league":"F1","name":"GP da Inglaterra","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_Siverstone_3-300x100.jpg","date":"02-07","dateShow":"02/07","dateType":"2022-07-02T14:00:00.000Z","time":"11h","situation":"Qualificação"},{"isF1":true,"type":"f1","league":"F1","name":"GP da Inglaterra","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_Siverstone_3-300x100.jpg","date":"03-07","dateShow":"03/07","dateType":"2022-07-03T14:00:00.000Z","time":"11h","situation":"Corrida"},{"isF1":true,"type":"f1","league":"F1","name":"GP da Áustria","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_RedBullRing_2-300x100.jpg","date":"08-07","dateShow":"08/07","dateType":"2022-07-08T11:30:00.000Z","time":"08h30","situation":"Treino Livre 1"},{"isF1":true,"type":"f1","league":"F1","name":"GP da Áustria","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_RedBullRing_2-300x100.jpg","date":"08-07","dateShow":"08/07","dateType":"2022-07-08T15:00:00.000Z","time":"12h","situation":"Qualificação"},{"isF1":true,"type":"f1","league":"F1","name":"GP da Áustria","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_RedBullRing_2-300x100.jpg","date":"09-07","dateShow":"09/07","dateType":"2022-07-09T10:30:00.000Z","time":"07h30","situation":"Treino Livre 2"},{"isF1":true,"type":"f1","league":"F1","name":"GP da Áustria","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_RedBullRing_2-300x100.jpg","date":"09-07","dateShow":"09/07","dateType":"2022-07-09T14:30:00.000Z","time":"11h30","situation":"Sprint"},{"isF1":true,"type":"f1","league":"F1","name":"GP da Áustria","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_RedBullRing_2-300x100.jpg","date":"10-07","dateShow":"10/07","dateType":"2022-07-10T13:00:00.000Z","time":"10h","situation":"Corrida"},{"isF1":true,"type":"f1","league":"F1","name":"GP da França","logo":"https://www.grandepremio.com.br/wp-content/uploads/2021/01/Circuitos_F1_Franca_1-300x100.jpg","date":"22-07","dateShow":"22/07","dateType":"2022-07-22T12:00:00.000Z","time":"09h","situation":"Treino Livre 1"},{"isF1":true,"type":"f1","league":"F1","name":"GP da França","logo":"https://www.grandepremio.com.br/wp-content/uploads/2021/01/Circuitos_F1_Franca_1-300x100.jpg","date":"22-07","dateShow":"22/07","dateType":"2022-07-22T15:00:00.000Z","time":"12h","situation":"Treino Livre 2"},{"isF1":true,"type":"f1","league":"F1","name":"GP da França","logo":"https://www.grandepremio.com.br/wp-content/uploads/2021/01/Circuitos_F1_Franca_1-300x100.jpg","date":"23-07","dateShow":"23/07","dateType":"2022-07-23T11:00:00.000Z","time":"08h","situation":"Treino Livre 3"},{"isF1":true,"type":"f1","league":"F1","name":"GP da França","logo":"https://www.grandepremio.com.br/wp-content/uploads/2021/01/Circuitos_F1_Franca_1-300x100.jpg","date":"23-07","dateShow":"23/07","dateType":"2022-07-23T14:00:00.000Z","time":"11h","situation":"Qualificação"},{"isF1":true,"type":"f1","league":"F1","name":"GP da França","logo":"https://www.grandepremio.com.br/wp-content/uploads/2021/01/Circuitos_F1_Franca_1-300x100.jpg","date":"24-07","dateShow":"24/07","dateType":"2022-07-24T13:00:00.000Z","time":"10h","situation":"Corrida"},{"isF1":true,"type":"f1","league":"F1","name":"GP da Hungria","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_Hungaroring_2-1-300x100.jpg","date":"29-07","dateShow":"29/07","dateType":"2022-07-29T12:00:00.000Z","time":"09h","situation":"Treino Livre 1"},{"isF1":true,"type":"f1","league":"F1","name":"GP da Hungria","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_Hungaroring_2-1-300x100.jpg","date":"29-07","dateShow":"29/07","dateType":"2022-07-29T15:00:00.000Z","time":"12h","situation":"Treino Livre 2"},{"isF1":true,"type":"f1","league":"F1","name":"GP da Hungria","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_Hungaroring_2-1-300x100.jpg","date":"30-07","dateShow":"30/07","dateType":"2022-07-30T11:00:00.000Z","time":"08h","situation":"Treino Livre 3"},{"isF1":true,"type":"f1","league":"F1","name":"GP da Hungria","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_Hungaroring_2-1-300x100.jpg","date":"30-07","dateShow":"30/07","dateType":"2022-07-30T14:00:00.000Z","time":"11h","situation":"Qualificação"},{"isF1":true,"type":"f1","league":"F1","name":"GP da Hungria","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_Hungaroring_2-1-300x100.jpg","date":"31-07","dateShow":"31/07","dateType":"2022-07-31T13:00:00.000Z","time":"10h","situation":"Corrida"},{"isF1":true,"type":"f1","league":"F1","name":"GP da Bélgica","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_Spa_3-300x100.jpg","date":"26-08","dateShow":"26/08","dateType":"2022-08-26T12:00:00.000Z","time":"09h","situation":"Treino Livre 1"},{"isF1":true,"type":"f1","league":"F1","name":"GP da Bélgica","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_Spa_3-300x100.jpg","date":"26-08","dateShow":"26/08","dateType":"2022-08-26T15:00:00.000Z","time":"12h","situation":"Treino Livre 2"},{"isF1":true,"type":"f1","league":"F1","name":"GP da Bélgica","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_Spa_3-300x100.jpg","date":"27-08","dateShow":"27/08","dateType":"2022-08-27T11:00:00.000Z","time":"08h","situation":"Treino Livre 3"},{"isF1":true,"type":"f1","league":"F1","name":"GP da Bélgica","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_Spa_3-300x100.jpg","date":"27-08","dateShow":"27/08","dateType":"2022-08-27T14:00:00.000Z","time":"11h","situation":"Qualificação"},{"isF1":true,"type":"f1","league":"F1","name":"GP da Bélgica","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_Spa_3-300x100.jpg","date":"28-08","dateShow":"28/08","dateType":"2022-08-28T13:00:00.000Z","time":"10h","situation":"Corrida"},{"isF1":true,"type":"f1","league":"F1","name":"GP da Holanda","logo":"https://www.grandepremio.com.br/wp-content/uploads/2021/01/Circuitos_F1_Holanda_1-300x100.jpg","date":"02-09","dateShow":"02/09","dateType":"2022-09-02T12:00:00.000Z","time":"09h","situation":"Treino Livre 1"},{"isF1":true,"type":"f1","league":"F1","name":"GP da Holanda","logo":"https://www.grandepremio.com.br/wp-content/uploads/2021/01/Circuitos_F1_Holanda_1-300x100.jpg","date":"02-09","dateShow":"02/09","dateType":"2022-09-02T15:00:00.000Z","time":"12h","situation":"Treino Livre 2"},{"isF1":true,"type":"f1","league":"F1","name":"GP da Holanda","logo":"https://www.grandepremio.com.br/wp-content/uploads/2021/01/Circuitos_F1_Holanda_1-300x100.jpg","date":"03-09","dateShow":"03/09","dateType":"2022-09-03T11:00:00.000Z","time":"08h","situation":"Treino Livre 3"},{"isF1":true,"type":"f1","league":"F1","name":"GP da Holanda","logo":"https://www.grandepremio.com.br/wp-content/uploads/2021/01/Circuitos_F1_Holanda_1-300x100.jpg","date":"03-09","dateShow":"03/09","dateType":"2022-09-03T14:00:00.000Z","time":"11h","situation":"Qualificação"},{"isF1":true,"type":"f1","league":"F1","name":"GP da Holanda","logo":"https://www.grandepremio.com.br/wp-content/uploads/2021/01/Circuitos_F1_Holanda_1-300x100.jpg","date":"04-09","dateShow":"04/09","dateType":"2022-09-04T13:00:00.000Z","time":"10h","situation":"Corrida"},{"isF1":true,"type":"f1","league":"F1","name":"GP da Itália","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_Monza_1-1-300x100.jpg","date":"09-09","dateShow":"09/09","dateType":"2022-09-09T12:00:00.000Z","time":"09h","situation":"Treino Livre 1"},{"isF1":true,"type":"f1","league":"F1","name":"GP da Itália","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_Monza_1-1-300x100.jpg","date":"09-09","dateShow":"09/09","dateType":"2022-09-09T15:00:00.000Z","time":"12h","situation":"Treino Livre 2"},{"isF1":true,"type":"f1","league":"F1","name":"GP da Itália","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_Monza_1-1-300x100.jpg","date":"10-09","dateShow":"10/09","dateType":"2022-09-10T11:00:00.000Z","time":"08h","situation":"Treino Livre 3"},{"isF1":true,"type":"f1","league":"F1","name":"GP da Itália","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_Monza_1-1-300x100.jpg","date":"10-09","dateShow":"10/09","dateType":"2022-09-10T14:00:00.000Z","time":"11h","situation":"Qualificação"},{"isF1":true,"type":"f1","league":"F1","name":"GP da Itália","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_Monza_1-1-300x100.jpg","date":"11-09","dateShow":"11/09","dateType":"2022-09-11T13:00:00.000Z","time":"10h","situation":"Corrida"},{"isF1":true,"type":"f1","league":"F1","name":"GP de Singapura","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/05/2019921121522_Mercedes_LewisHamilton_64_DMa-300x200.jpg","date":"30-09","dateShow":"30/09","dateType":"2022-09-30T10:00:00.000Z","time":"07h","situation":"Treino Livre 1"},{"isF1":true,"type":"f1","league":"F1","name":"GP de Singapura","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/05/2019921121522_Mercedes_LewisHamilton_64_DMa-300x200.jpg","date":"30-09","dateShow":"30/09","dateType":"2022-09-30T13:00:00.000Z","time":"10h","situation":"Treino Livre 2"},{"isF1":true,"type":"f1","league":"F1","name":"GP de Singapura","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/05/2019921121522_Mercedes_LewisHamilton_64_DMa-300x200.jpg","date":"01-10","dateShow":"01/10","dateType":"2022-10-01T10:00:00.000Z","time":"07h","situation":"Treino Livre 3"},{"isF1":true,"type":"f1","league":"F1","name":"GP de Singapura","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/05/2019921121522_Mercedes_LewisHamilton_64_DMa-300x200.jpg","date":"01-10","dateShow":"01/10","dateType":"2022-10-01T13:00:00.000Z","time":"10h","situation":"Qualificação"},{"isF1":true,"type":"f1","league":"F1","name":"GP de Singapura","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/05/2019921121522_Mercedes_LewisHamilton_64_DMa-300x200.jpg","date":"02-10","dateShow":"02/10","dateType":"2022-10-02T12:00:00.000Z","time":"09h","situation":"Corrida"},{"isF1":true,"type":"f1","league":"F1","name":"GP do Japão","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/03/20191013541260_Williams_RobertKubica_71_DMa-300x200.jpg","date":"07-10","dateShow":"07/10","dateType":"2022-10-07T04:00:00.000Z","time":"01h","situation":"Treino Livre 1"},{"isF1":true,"type":"f1","league":"F1","name":"GP do Japão","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/03/20191013541260_Williams_RobertKubica_71_DMa-300x200.jpg","date":"07-10","dateShow":"07/10","dateType":"2022-10-07T07:00:00.000Z","time":"04h","situation":"Treino Livre 2"},{"isF1":true,"type":"f1","league":"F1","name":"GP do Japão","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/03/20191013541260_Williams_RobertKubica_71_DMa-300x200.jpg","date":"08-10","dateShow":"08/10","dateType":"2022-10-08T04:00:00.000Z","time":"01h","situation":"Treino Livre 3"},{"isF1":true,"type":"f1","league":"F1","name":"GP do Japão","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/03/20191013541260_Williams_RobertKubica_71_DMa-300x200.jpg","date":"08-10","dateShow":"08/10","dateType":"2022-10-08T07:00:00.000Z","time":"04h","situation":"Qualificação"},{"isF1":true,"type":"f1","league":"F1","name":"GP do Japão","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/03/20191013541260_Williams_RobertKubica_71_DMa-300x200.jpg","date":"09-10","dateShow":"09/10","dateType":"2022-10-09T05:00:00.000Z","time":"02h","situation":"Corrida"},{"isF1":true,"type":"f1","league":"F1","name":"GP dos EUA","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_COTA_3-1-300x100.jpg","date":"21-10","dateShow":"21/10","dateType":"2022-10-21T19:00:00.000Z","time":"16h","situation":"Treino Livre 1"},{"isF1":true,"type":"f1","league":"F1","name":"GP dos EUA","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_COTA_3-1-300x100.jpg","date":"21-10","dateShow":"21/10","dateType":"2022-10-21T22:00:00.000Z","time":"19h","situation":"Treino Livre 2"},{"isF1":true,"type":"f1","league":"F1","name":"GP dos EUA","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_COTA_3-1-300x100.jpg","date":"22-10","dateShow":"22/10","dateType":"2022-10-22T19:00:00.000Z","time":"16h","situation":"Treino Livre 3"},{"isF1":true,"type":"f1","league":"F1","name":"GP dos EUA","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_COTA_3-1-300x100.jpg","date":"22-10","dateShow":"22/10","dateType":"2022-10-22T22:00:00.000Z","time":"19h","situation":"Qualificação"},{"isF1":true,"type":"f1","league":"F1","name":"GP dos EUA","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_COTA_3-1-300x100.jpg","date":"23-10","dateShow":"23/10","dateType":"2022-10-23T19:00:00.000Z","time":"16h","situation":"Corrida"},{"isF1":true,"type":"f1","league":"F1","name":"GP do México","logo":"https://www.grandepremio.com.br/wp-content/uploads/2021/01/Circuitos_F1_Mexico_1-300x100.jpg","date":"28-10","dateShow":"28/10","dateType":"2022-10-28T17:00:00.000Z","time":"14h","situation":"Treino Livre 1"},{"isF1":true,"type":"f1","league":"F1","name":"GP do México","logo":"https://www.grandepremio.com.br/wp-content/uploads/2021/01/Circuitos_F1_Mexico_1-300x100.jpg","date":"28-10","dateShow":"28/10","dateType":"2022-10-28T20:00:00.000Z","time":"17h","situation":"Treino Livre 2"},{"isF1":true,"type":"f1","league":"F1","name":"GP do México","logo":"https://www.grandepremio.com.br/wp-content/uploads/2021/01/Circuitos_F1_Mexico_1-300x100.jpg","date":"29-10","dateShow":"29/10","dateType":"2022-10-29T17:00:00.000Z","time":"14h","situation":"Treino Livre 3"},{"isF1":true,"type":"f1","league":"F1","name":"GP do México","logo":"https://www.grandepremio.com.br/wp-content/uploads/2021/01/Circuitos_F1_Mexico_1-300x100.jpg","date":"29-10","dateShow":"29/10","dateType":"2022-10-29T20:00:00.000Z","time":"17h","situation":"Qualificação"},{"isF1":true,"type":"f1","league":"F1","name":"GP do México","logo":"https://www.grandepremio.com.br/wp-content/uploads/2021/01/Circuitos_F1_Mexico_1-300x100.jpg","date":"30-10","dateShow":"30/10","dateType":"2022-10-30T19:00:00.000Z","time":"16h","situation":"Corrida"},{"isF1":true,"type":"f1","league":"F1","name":"GP de São Paulo","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_Interlagos_3-1-300x100.jpg","date":"11-11","dateShow":"11/11","dateType":"2022-11-11T15:30:00.000Z","time":"12h30","situation":"Treino Livre 1"},{"isF1":true,"type":"f1","league":"F1","name":"GP de São Paulo","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_Interlagos_3-1-300x100.jpg","date":"11-11","dateShow":"11/11","dateType":"2022-11-11T19:00:00.000Z","time":"16h","situation":"Qualificação"},{"isF1":true,"type":"f1","league":"F1","name":"GP de São Paulo","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_Interlagos_3-1-300x100.jpg","date":"12-11","dateShow":"12/11","dateType":"2022-11-12T15:30:00.000Z","time":"12h30","situation":"Treino Livre 2"},{"isF1":true,"type":"f1","league":"F1","name":"GP de São Paulo","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_Interlagos_3-1-300x100.jpg","date":"12-11","dateShow":"12/11","dateType":"2022-11-12T19:30:00.000Z","time":"16h30","situation":"Sprint"},{"isF1":true,"type":"f1","league":"F1","name":"GP de São Paulo","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_Interlagos_3-1-300x100.jpg","date":"13-11","dateShow":"13/11","dateType":"2022-11-13T18:00:00.000Z","time":"15h","situation":"Corrida"},{"isF1":true,"type":"f1","league":"F1","name":"GP de Abu Dhabi","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_AbuDhabi_1-1-300x100.jpg","date":"18-11","dateShow":"18/11","dateType":"2022-11-18T10:00:00.000Z","time":"07h","situation":"Treino Livre 1"},{"isF1":true,"type":"f1","league":"F1","name":"GP de Abu Dhabi","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_AbuDhabi_1-1-300x100.jpg","date":"18-11","dateShow":"18/11","dateType":"2022-11-18T13:00:00.000Z","time":"10h","situation":"Treino Livre 2"},{"isF1":true,"type":"f1","league":"F1","name":"GP de Abu Dhabi","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_AbuDhabi_1-1-300x100.jpg","date":"19-11","dateShow":"19/11","dateType":"2022-11-19T11:00:00.000Z","time":"08h","situation":"Treino Livre 3"},{"isF1":true,"type":"f1","league":"F1","name":"GP de Abu Dhabi","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_AbuDhabi_1-1-300x100.jpg","date":"19-11","dateShow":"19/11","dateType":"2022-11-19T14:00:00.000Z","time":"11h","situation":"Qualificação"},{"isF1":true,"type":"f1","league":"F1","name":"GP de Abu Dhabi","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_AbuDhabi_1-1-300x100.jpg","date":"20-11","dateShow":"20/11","dateType":"2022-11-20T13:00:00.000Z","time":"10h","situation":"Corrida"}]
    
    let newInfo = [],
        dateNowStr = dateNow.toISOString(),
        dateWeekStr = (new Date(dateNow.getTime() + 604800000)).toISOString()

    allInfo.forEach((oneInfo) => {
        if(oneInfo.dateType > dateNowStr && oneInfo.dateType < dateWeekStr){
            oneInfo.dateType = new Date(oneInfo.dateType)
            newInfo.push(oneInfo)
        }
    })

    return newInfo

}

async function makeNFL() {

    try{
        let nflData = JSON.parse(await getPromise(process.env.URL_NFL)),
            allGamesNFL = []
        
        try{

            for(let oneGame of nflData.sports[0].leagues[0].events){

                let dateGame = new Date(new Date(oneGame.date).getTime() - 10800000)
                dateGameStr = mountDayMonth(dateGame.getDate(), dateGame.getMonth());

                if(dateGame.getTime() > (dateNow.getTime() + 28800000)){
                    allGamesNFL.push({
                        color: 'RoyalBlue',
                        type: 'nfl',
                        league: 'NFL',
                        teamHome: oneGame.competitors[0].displayName,
                        acronymHome: oneGame.competitors[0].abbreviation,
                        teamAway: oneGame.competitors[1].displayName,
                        acronymAway: oneGame.competitors[1].abbreviation,
                        date: dateGameStr,
                        dateShow: dateGameStr.replace('-','/'),
                        dateType: dateGame,
                        time: mountHour(dateGame.getHours(), dateGame.getMinutes()),
                        logoHome: oneGame.competitors[0].logoDark,
                        logoAway: oneGame.competitors[1].logoDark,
                        transmission: oneGame.location,
                        situation: oneGame.weekText
                    }) 
                }
            }
        }
        catch(err){
            console.log(err)
        }

        return allGamesNFL;

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
            gamesNow = gamesNow.concat(makeF1());
            gamesNow = gamesNow.concat(await makeNFL());

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