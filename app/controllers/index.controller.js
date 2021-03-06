const https = require('https')

const   fs = require('fs')

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

                            //console.log(oneGame.broadcasters.intlTvBroadcasters[0].broadcasterDisplay)

                            //console.log(oneGame)
        
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
/* 
    let allInfo = [{name: 'GP da Em??lia-Romanha',sexta: '22/04/2022@8h30 ??s 9h30 ??? Treino Livre 1&12h ??s 13h ??? Qualifica????o',sabado: '23/04/2022@7h30 ??s 8h30 ??? Treino Livre 2&11h30 ??? Sprint',domingo: '24/04/2022@10h ??? Corrida',logo: 'https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_SanMarino_2-300x100.jpg'},{name: 'GP de Miami',sexta: '06/05/2022@15h30 ??s 16h30 ??? Treino Livre 1&18h30 ??s 19h30 ??? Treino Livre 2',sabado: '07/05/2022@14h ??s 15h ??? Treino Livre 3&17h ??s 18h ??? Qualifica????o',domingo: '08/05/2022@16h30 ??? Corrida',logo: 'https://www.grandepremio.com.br/wp-content/uploads/2021/12/Circuitos_F1_Miami_1-300x100.jpg'},{name: 'GP da Espanha',sexta: '20/05/2022@9h ??s 10h ??? Treino Livre 1&12h ??s 13h ??? Treino Livre 2',sabado: '21/05/2022@8h ??s 9h ??? Treino Livre 3&11h ??s 12h ??? Qualifica????o',domingo: '22/05/2022@10h ??? Corrida',logo: 'https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_Barcelona_3-1-300x100.jpg'},{name: 'GP de M??naco',sexta: '27/05/2022@9h ??s 10h ??? Treino Livre 1&12h ??s 13h ??? Treino Livre 2',sabado: '28/05/2022@8h ??s 9h ??? Treino Livre 3&11h ??s 12h ??? Qualifica????o',domingo: '29/05/2022@10h ??? Corrida',logo: 'https://www.grandepremio.com.br/wp-content/uploads/2021/01/Circuitos_F1_Monaco_1-300x100.jpg'},{name: 'GP do Azerbaij??o',sexta: '10/06/2022@9h ??s 10h ??? Treino Livre 1&12h ??s 13h ??? Treino Livre 2',sabado: '11/06/2022@8h ??s 9h ??? Treino Livre 3&11h ??s 12h ??? Qualifica????o',domingo: '12/06/2022@8h ??? Corrida',logo: 'https://www.grandepremio.com.br/wp-content/uploads/2021/01/Circuitos_F1_Azerbaijao_1-300x100.jpg'},{name: 'GP do Canad??',sexta: '17/06/2022@15h ??s 16h ??? Treino Livre 1&18h ??s 19h ??? Treino Livre 2',sabado: '18/06/2022@14h ??s 15h ??? Treino Livre 3&17h ??s 18h ??? Qualifica????o',domingo: '19/06/2022@15h ??? Corrida',logo: 'https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_GillesVilleneuve_2-1-300x100.jpg'},{name: 'GP da Inglaterra',sexta: '01/07/2022@9h ??s 10h ??? Treino Livre 1&12h ??s 13h ??? Treino Livre 2',sabado: '02/07/2022@8h ??s 9h ??? Treino Livre 3&11h ??s 12h ??? Qualifica????o',domingo: '03/07/2022@11h ??? Corrida',logo: 'https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_Siverstone_3-300x100.jpg'},{name: 'GP da ??ustria',sexta: '08/07/2022@8h30 ??s 9h30 ??? Treino Livre 1&12h ??s 13h ??? Qualifica????o',sabado: '09/07/2022@7h30 ??s 8h30 ??? Treino Livre 2&11h30 ??? Sprint',domingo: '10/07/2022@10h ??? Corrida',logo: 'https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_RedBullRing_2-300x100.jpg'},{name: 'GP da Fran??a',sexta: '22/07/2022@9h ??s 10h ??? Treino Livre 1&12h ??s 13h ??? Treino Livre 2',sabado: '23/07/2022@8h ??s 9h ??? Treino Livre 3&11h ??s 12h ??? Qualifica????o',domingo: '24/07/2022@10h ??? Corrida',logo: 'https://www.grandepremio.com.br/wp-content/uploads/2021/01/Circuitos_F1_Franca_1-300x100.jpg'},{name: 'GP da Hungria',sexta: '29/07/2022@9h ??s 10h ??? Treino Livre 1&12h ??s 13h ??? Treino Livre 2',sabado: '30/07/2022@8h ??s 9h ??? Treino Livre 3&11h ??s 12h ??? Qualifica????o',domingo: '31/07/2022@10h ??? Corrida',logo: 'https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_Hungaroring_2-1-300x100.jpg'},{name: 'GP da B??lgica',sexta: '26/08/2022@9h ??s 10h ??? Treino Livre 1&12h ??s 13h ??? Treino Livre 2',sabado: '27/08/2022@8h ??s 9h ??? Treino Livre 3&11h ??s 12h ??? Qualifica????o',domingo: '28/08/2022@10h ??? Corrida',logo: 'https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_Spa_3-300x100.jpg'},{name: 'GP da Holanda',sexta: '02/09/2022@9h ??s 10h ??? Treino Livre 1&12h ??s 13h ??? Treino Livre 2',sabado: '03/09/2022@8h ??s 9h ??? Treino Livre 3&11h ??s 12h ??? Qualifica????o',domingo: '04/09/2022@10h ??? Corrida',logo: 'https://www.grandepremio.com.br/wp-content/uploads/2021/01/Circuitos_F1_Holanda_1-300x100.jpg'},{name: 'GP da It??lia',sexta: '09/09/2022@9h ??s 10h ??? Treino Livre 1&12h ??s 13h ??? Treino Livre 2',sabado: '10/09/2022@8h ??s 9h ??? Treino Livre 3&11h ??s 12h ??? Qualifica????o',domingo: '11/09/2022@10h ??? Corrida',logo: 'https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_Monza_1-1-300x100.jpg'},{name: 'GP de Singapura',sexta: '30/09/2022@7h ??s 8h ??? Treino Livre 1&10h ??s 11h ??? Treino Livre 2',sabado: '01/10/2022@7h ??s 8h ??? Treino Livre 3&10h ??s 11h ??? Qualifica????o',domingo: '02/10/2022@9h ??? Corrida',logo: 'https://www.grandepremio.com.br/wp-content/uploads/2020/05/2019921121522_Mercedes_LewisHamilton_64_DMa-300x200.jpg'},{name: 'GP do Jap??o',sexta: '07/10/2022@1h ??s 2h ??? Treino Livre 1&4h ??s 5h ??? Treino Livre 2',sabado: '08/10/2022@1h ??s 2h ??? Treino Livre 3&4h ??s 5h ??? Qualifica????o',domingo: '09/10/2022@2h ??? Corrida',logo: 'https://www.grandepremio.com.br/wp-content/uploads/2020/03/20191013541260_Williams_RobertKubica_71_DMa-300x200.jpg'},{name: 'GP dos EUA',sexta: '21/10/2022@16h ??s 17h ??? Treino Livre 1&19h ??s 20h ??? Treino Livre 2',sabado: '22/10/2022@16h ??s 17h ??? Treino Livre 3&19h ??s 20h ??? Qualifica????o',domingo: '23/10/2022@16h ??? Corrida',logo: 'https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_COTA_3-1-300x100.jpg'},{name: 'GP do M??xico',sexta: '28/10/2022@14h ??s 15h ??? Treino Livre 1&17h ??s 18h ??? Treino Livre 2',sabado: '29/10/2022@14h ??s 15h ??? Treino Livre 3&17h ??s 18h ??? Qualifica????o',domingo: '30/10/2022@16h ??? Corrida',logo: 'https://www.grandepremio.com.br/wp-content/uploads/2021/01/Circuitos_F1_Mexico_1-300x100.jpg'},{name: 'GP de S??o Paulo',sexta: '11/11/2022@12h30 ??s 13h30 ??? Treino Livre 1&16h ??s 17h ??? Qualifica????o',sabado: '12/11/2022@12h30 ??s 13h30 ??? Treino Livre 2&16h30 ??? Sprint',domingo: '13/11/2022@15h ??? Corrida',logo: 'https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_Interlagos_3-1-300x100.jpg'},{name: 'GP de Abu Dhabi',sexta: '18/11/2022@7h ??s 8h ??? Treino Livre 1&10h ??s 11h ??? Treino Livre 2',sabado: '19/11/2022@8h ??s 9h ??? Treino Livre 3&11h ??s 12h ??? Qualifica????o',domingo: '20/11/2022@10h ??? Corrida',logo: 'https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_AbuDhabi_1-1-300x100.jpg'}]

    let allDays = ['sexta', 'sabado', 'domingo'],
        newInfos = []

     for(oneInfo of allInfo){
        
        for(oneDay of allDays){
            let datePartOne = oneInfo[oneDay].split('@')[0].split('/'),
                infoDetails = oneInfo[oneDay].split('@')[1].split('&')

            for(oneInfoDetail of infoDetails){
                let timeAux = oneInfoDetail.split('???')[0].split(' ??s')[0].trim(),
                    dateTypeAux = new Date(parseInt(datePartOne[2]), parseInt(datePartOne[1]) - 1, parseInt(datePartOne[0]), parseInt(timeAux.split('h')[0]), isNaN(parseInt(timeAux.split('h')[1])) ? 0 : parseInt(timeAux.split('h')[1])),
                    dateAux = mountDayMonth(dateTypeAux.getDate(), dateTypeAux.getMonth())

                if(dateTypeAux.getTime() < (dateNow.getTime() + 604800000)){
                    newInfos.push({
                        isF1: true,
                        type: 'f1',
                        league: 'F1',
        
                        name: oneInfo.name,
                        logo: oneInfo.logo,
        
                        date: dateAux,
                        dateShow: dateAux.replace('-', '/'),
                        dateType: dateTypeAux,
                        time: timeAux[1] == 'h' ? '0' + timeAux : timeAux,
                        
                        situation: oneInfoDetail.split('???')[1].trim()
                    })
                }
            }
        }
    }

    fs.writeFile('static/js/dataF1.json', JSON.stringify(newInfos), (err) => {
        if (err) throw err;
            console.log('Saved!');
    })
    return newInfos
 */

    
    let allInfo = [{"isF1":true,"type":"f1","league":"F1","name":"GP da Em??lia-Romanha","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_SanMarino_2-300x100.jpg","date":"22-04","dateShow":"22/04","dateType":"2022-04-22T11:30:00.000Z","time":"08h30","situation":"Treino Livre 1"},{"isF1":true,"type":"f1","league":"F1","name":"GP da Em??lia-Romanha","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_SanMarino_2-300x100.jpg","date":"22-04","dateShow":"22/04","dateType":"2022-04-22T15:00:00.000Z","time":"12h","situation":"Qualifica????o"},{"isF1":true,"type":"f1","league":"F1","name":"GP da Em??lia-Romanha","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_SanMarino_2-300x100.jpg","date":"23-04","dateShow":"23/04","dateType":"2022-04-23T10:30:00.000Z","time":"07h30","situation":"Treino Livre 2"},{"isF1":true,"type":"f1","league":"F1","name":"GP da Em??lia-Romanha","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_SanMarino_2-300x100.jpg","date":"23-04","dateShow":"23/04","dateType":"2022-04-23T14:30:00.000Z","time":"11h30","situation":"Sprint"},{"isF1":true,"type":"f1","league":"F1","name":"GP da Em??lia-Romanha","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_SanMarino_2-300x100.jpg","date":"24-04","dateShow":"24/04","dateType":"2022-04-24T13:00:00.000Z","time":"10h","situation":"Corrida"},{"isF1":true,"type":"f1","league":"F1","name":"GP de Miami","logo":"https://www.grandepremio.com.br/wp-content/uploads/2021/12/Circuitos_F1_Miami_1-300x100.jpg","date":"06-05","dateShow":"06/05","dateType":"2022-05-06T18:30:00.000Z","time":"15h30","situation":"Treino Livre 1"},{"isF1":true,"type":"f1","league":"F1","name":"GP de Miami","logo":"https://www.grandepremio.com.br/wp-content/uploads/2021/12/Circuitos_F1_Miami_1-300x100.jpg","date":"06-05","dateShow":"06/05","dateType":"2022-05-06T21:30:00.000Z","time":"18h30","situation":"Treino Livre 2"},{"isF1":true,"type":"f1","league":"F1","name":"GP de Miami","logo":"https://www.grandepremio.com.br/wp-content/uploads/2021/12/Circuitos_F1_Miami_1-300x100.jpg","date":"07-05","dateShow":"07/05","dateType":"2022-05-07T17:00:00.000Z","time":"14h","situation":"Treino Livre 3"},{"isF1":true,"type":"f1","league":"F1","name":"GP de Miami","logo":"https://www.grandepremio.com.br/wp-content/uploads/2021/12/Circuitos_F1_Miami_1-300x100.jpg","date":"07-05","dateShow":"07/05","dateType":"2022-05-07T20:00:00.000Z","time":"17h","situation":"Qualifica????o"},{"isF1":true,"type":"f1","league":"F1","name":"GP de Miami","logo":"https://www.grandepremio.com.br/wp-content/uploads/2021/12/Circuitos_F1_Miami_1-300x100.jpg","date":"08-05","dateShow":"08/05","dateType":"2022-05-08T19:30:00.000Z","time":"16h30","situation":"Corrida"},{"isF1":true,"type":"f1","league":"F1","name":"GP da Espanha","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_Barcelona_3-1-300x100.jpg","date":"20-05","dateShow":"20/05","dateType":"2022-05-20T12:00:00.000Z","time":"09h","situation":"Treino Livre 1"},{"isF1":true,"type":"f1","league":"F1","name":"GP da Espanha","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_Barcelona_3-1-300x100.jpg","date":"20-05","dateShow":"20/05","dateType":"2022-05-20T15:00:00.000Z","time":"12h","situation":"Treino Livre 2"},{"isF1":true,"type":"f1","league":"F1","name":"GP da Espanha","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_Barcelona_3-1-300x100.jpg","date":"21-05","dateShow":"21/05","dateType":"2022-05-21T11:00:00.000Z","time":"08h","situation":"Treino Livre 3"},{"isF1":true,"type":"f1","league":"F1","name":"GP da Espanha","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_Barcelona_3-1-300x100.jpg","date":"21-05","dateShow":"21/05","dateType":"2022-05-21T14:00:00.000Z","time":"11h","situation":"Qualifica????o"},{"isF1":true,"type":"f1","league":"F1","name":"GP da Espanha","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_Barcelona_3-1-300x100.jpg","date":"22-05","dateShow":"22/05","dateType":"2022-05-22T13:00:00.000Z","time":"10h","situation":"Corrida"},{"isF1":true,"type":"f1","league":"F1","name":"GP de M??naco","logo":"https://www.grandepremio.com.br/wp-content/uploads/2021/01/Circuitos_F1_Monaco_1-300x100.jpg","date":"27-05","dateShow":"27/05","dateType":"2022-05-27T12:00:00.000Z","time":"09h","situation":"Treino Livre 1"},{"isF1":true,"type":"f1","league":"F1","name":"GP de M??naco","logo":"https://www.grandepremio.com.br/wp-content/uploads/2021/01/Circuitos_F1_Monaco_1-300x100.jpg","date":"27-05","dateShow":"27/05","dateType":"2022-05-27T15:00:00.000Z","time":"12h","situation":"Treino Livre 2"},{"isF1":true,"type":"f1","league":"F1","name":"GP de M??naco","logo":"https://www.grandepremio.com.br/wp-content/uploads/2021/01/Circuitos_F1_Monaco_1-300x100.jpg","date":"28-05","dateShow":"28/05","dateType":"2022-05-28T11:00:00.000Z","time":"08h","situation":"Treino Livre 3"},{"isF1":true,"type":"f1","league":"F1","name":"GP de M??naco","logo":"https://www.grandepremio.com.br/wp-content/uploads/2021/01/Circuitos_F1_Monaco_1-300x100.jpg","date":"28-05","dateShow":"28/05","dateType":"2022-05-28T14:00:00.000Z","time":"11h","situation":"Qualifica????o"},{"isF1":true,"type":"f1","league":"F1","name":"GP de M??naco","logo":"https://www.grandepremio.com.br/wp-content/uploads/2021/01/Circuitos_F1_Monaco_1-300x100.jpg","date":"29-05","dateShow":"29/05","dateType":"2022-05-29T13:00:00.000Z","time":"10h","situation":"Corrida"},{"isF1":true,"type":"f1","league":"F1","name":"GP do Azerbaij??o","logo":"https://www.grandepremio.com.br/wp-content/uploads/2021/01/Circuitos_F1_Azerbaijao_1-300x100.jpg","date":"10-06","dateShow":"10/06","dateType":"2022-06-10T12:00:00.000Z","time":"09h","situation":"Treino Livre 1"},{"isF1":true,"type":"f1","league":"F1","name":"GP do Azerbaij??o","logo":"https://www.grandepremio.com.br/wp-content/uploads/2021/01/Circuitos_F1_Azerbaijao_1-300x100.jpg","date":"10-06","dateShow":"10/06","dateType":"2022-06-10T15:00:00.000Z","time":"12h","situation":"Treino Livre 2"},{"isF1":true,"type":"f1","league":"F1","name":"GP do Azerbaij??o","logo":"https://www.grandepremio.com.br/wp-content/uploads/2021/01/Circuitos_F1_Azerbaijao_1-300x100.jpg","date":"11-06","dateShow":"11/06","dateType":"2022-06-11T11:00:00.000Z","time":"08h","situation":"Treino Livre 3"},{"isF1":true,"type":"f1","league":"F1","name":"GP do Azerbaij??o","logo":"https://www.grandepremio.com.br/wp-content/uploads/2021/01/Circuitos_F1_Azerbaijao_1-300x100.jpg","date":"11-06","dateShow":"11/06","dateType":"2022-06-11T14:00:00.000Z","time":"11h","situation":"Qualifica????o"},{"isF1":true,"type":"f1","league":"F1","name":"GP do Azerbaij??o","logo":"https://www.grandepremio.com.br/wp-content/uploads/2021/01/Circuitos_F1_Azerbaijao_1-300x100.jpg","date":"12-06","dateShow":"12/06","dateType":"2022-06-12T11:00:00.000Z","time":"08h","situation":"Corrida"},{"isF1":true,"type":"f1","league":"F1","name":"GP do Canad??","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_GillesVilleneuve_2-1-300x100.jpg","date":"17-06","dateShow":"17/06","dateType":"2022-06-17T18:00:00.000Z","time":"15h","situation":"Treino Livre 1"},{"isF1":true,"type":"f1","league":"F1","name":"GP do Canad??","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_GillesVilleneuve_2-1-300x100.jpg","date":"17-06","dateShow":"17/06","dateType":"2022-06-17T21:00:00.000Z","time":"18h","situation":"Treino Livre 2"},{"isF1":true,"type":"f1","league":"F1","name":"GP do Canad??","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_GillesVilleneuve_2-1-300x100.jpg","date":"18-06","dateShow":"18/06","dateType":"2022-06-18T17:00:00.000Z","time":"14h","situation":"Treino Livre 3"},{"isF1":true,"type":"f1","league":"F1","name":"GP do Canad??","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_GillesVilleneuve_2-1-300x100.jpg","date":"18-06","dateShow":"18/06","dateType":"2022-06-18T20:00:00.000Z","time":"17h","situation":"Qualifica????o"},{"isF1":true,"type":"f1","league":"F1","name":"GP do Canad??","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_GillesVilleneuve_2-1-300x100.jpg","date":"19-06","dateShow":"19/06","dateType":"2022-06-19T18:00:00.000Z","time":"15h","situation":"Corrida"},{"isF1":true,"type":"f1","league":"F1","name":"GP da Inglaterra","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_Siverstone_3-300x100.jpg","date":"01-07","dateShow":"01/07","dateType":"2022-07-01T12:00:00.000Z","time":"09h","situation":"Treino Livre 1"},{"isF1":true,"type":"f1","league":"F1","name":"GP da Inglaterra","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_Siverstone_3-300x100.jpg","date":"01-07","dateShow":"01/07","dateType":"2022-07-01T15:00:00.000Z","time":"12h","situation":"Treino Livre 2"},{"isF1":true,"type":"f1","league":"F1","name":"GP da Inglaterra","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_Siverstone_3-300x100.jpg","date":"02-07","dateShow":"02/07","dateType":"2022-07-02T11:00:00.000Z","time":"08h","situation":"Treino Livre 3"},{"isF1":true,"type":"f1","league":"F1","name":"GP da Inglaterra","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_Siverstone_3-300x100.jpg","date":"02-07","dateShow":"02/07","dateType":"2022-07-02T14:00:00.000Z","time":"11h","situation":"Qualifica????o"},{"isF1":true,"type":"f1","league":"F1","name":"GP da Inglaterra","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_Siverstone_3-300x100.jpg","date":"03-07","dateShow":"03/07","dateType":"2022-07-03T14:00:00.000Z","time":"11h","situation":"Corrida"},{"isF1":true,"type":"f1","league":"F1","name":"GP da ??ustria","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_RedBullRing_2-300x100.jpg","date":"08-07","dateShow":"08/07","dateType":"2022-07-08T11:30:00.000Z","time":"08h30","situation":"Treino Livre 1"},{"isF1":true,"type":"f1","league":"F1","name":"GP da ??ustria","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_RedBullRing_2-300x100.jpg","date":"08-07","dateShow":"08/07","dateType":"2022-07-08T15:00:00.000Z","time":"12h","situation":"Qualifica????o"},{"isF1":true,"type":"f1","league":"F1","name":"GP da ??ustria","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_RedBullRing_2-300x100.jpg","date":"09-07","dateShow":"09/07","dateType":"2022-07-09T10:30:00.000Z","time":"07h30","situation":"Treino Livre 2"},{"isF1":true,"type":"f1","league":"F1","name":"GP da ??ustria","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_RedBullRing_2-300x100.jpg","date":"09-07","dateShow":"09/07","dateType":"2022-07-09T14:30:00.000Z","time":"11h30","situation":"Sprint"},{"isF1":true,"type":"f1","league":"F1","name":"GP da ??ustria","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_RedBullRing_2-300x100.jpg","date":"10-07","dateShow":"10/07","dateType":"2022-07-10T13:00:00.000Z","time":"10h","situation":"Corrida"},{"isF1":true,"type":"f1","league":"F1","name":"GP da Fran??a","logo":"https://www.grandepremio.com.br/wp-content/uploads/2021/01/Circuitos_F1_Franca_1-300x100.jpg","date":"22-07","dateShow":"22/07","dateType":"2022-07-22T12:00:00.000Z","time":"09h","situation":"Treino Livre 1"},{"isF1":true,"type":"f1","league":"F1","name":"GP da Fran??a","logo":"https://www.grandepremio.com.br/wp-content/uploads/2021/01/Circuitos_F1_Franca_1-300x100.jpg","date":"22-07","dateShow":"22/07","dateType":"2022-07-22T15:00:00.000Z","time":"12h","situation":"Treino Livre 2"},{"isF1":true,"type":"f1","league":"F1","name":"GP da Fran??a","logo":"https://www.grandepremio.com.br/wp-content/uploads/2021/01/Circuitos_F1_Franca_1-300x100.jpg","date":"23-07","dateShow":"23/07","dateType":"2022-07-23T11:00:00.000Z","time":"08h","situation":"Treino Livre 3"},{"isF1":true,"type":"f1","league":"F1","name":"GP da Fran??a","logo":"https://www.grandepremio.com.br/wp-content/uploads/2021/01/Circuitos_F1_Franca_1-300x100.jpg","date":"23-07","dateShow":"23/07","dateType":"2022-07-23T14:00:00.000Z","time":"11h","situation":"Qualifica????o"},{"isF1":true,"type":"f1","league":"F1","name":"GP da Fran??a","logo":"https://www.grandepremio.com.br/wp-content/uploads/2021/01/Circuitos_F1_Franca_1-300x100.jpg","date":"24-07","dateShow":"24/07","dateType":"2022-07-24T13:00:00.000Z","time":"10h","situation":"Corrida"},{"isF1":true,"type":"f1","league":"F1","name":"GP da Hungria","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_Hungaroring_2-1-300x100.jpg","date":"29-07","dateShow":"29/07","dateType":"2022-07-29T12:00:00.000Z","time":"09h","situation":"Treino Livre 1"},{"isF1":true,"type":"f1","league":"F1","name":"GP da Hungria","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_Hungaroring_2-1-300x100.jpg","date":"29-07","dateShow":"29/07","dateType":"2022-07-29T15:00:00.000Z","time":"12h","situation":"Treino Livre 2"},{"isF1":true,"type":"f1","league":"F1","name":"GP da Hungria","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_Hungaroring_2-1-300x100.jpg","date":"30-07","dateShow":"30/07","dateType":"2022-07-30T11:00:00.000Z","time":"08h","situation":"Treino Livre 3"},{"isF1":true,"type":"f1","league":"F1","name":"GP da Hungria","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_Hungaroring_2-1-300x100.jpg","date":"30-07","dateShow":"30/07","dateType":"2022-07-30T14:00:00.000Z","time":"11h","situation":"Qualifica????o"},{"isF1":true,"type":"f1","league":"F1","name":"GP da Hungria","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_Hungaroring_2-1-300x100.jpg","date":"31-07","dateShow":"31/07","dateType":"2022-07-31T13:00:00.000Z","time":"10h","situation":"Corrida"},{"isF1":true,"type":"f1","league":"F1","name":"GP da B??lgica","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_Spa_3-300x100.jpg","date":"26-08","dateShow":"26/08","dateType":"2022-08-26T12:00:00.000Z","time":"09h","situation":"Treino Livre 1"},{"isF1":true,"type":"f1","league":"F1","name":"GP da B??lgica","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_Spa_3-300x100.jpg","date":"26-08","dateShow":"26/08","dateType":"2022-08-26T15:00:00.000Z","time":"12h","situation":"Treino Livre 2"},{"isF1":true,"type":"f1","league":"F1","name":"GP da B??lgica","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_Spa_3-300x100.jpg","date":"27-08","dateShow":"27/08","dateType":"2022-08-27T11:00:00.000Z","time":"08h","situation":"Treino Livre 3"},{"isF1":true,"type":"f1","league":"F1","name":"GP da B??lgica","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_Spa_3-300x100.jpg","date":"27-08","dateShow":"27/08","dateType":"2022-08-27T14:00:00.000Z","time":"11h","situation":"Qualifica????o"},{"isF1":true,"type":"f1","league":"F1","name":"GP da B??lgica","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_Spa_3-300x100.jpg","date":"28-08","dateShow":"28/08","dateType":"2022-08-28T13:00:00.000Z","time":"10h","situation":"Corrida"},{"isF1":true,"type":"f1","league":"F1","name":"GP da Holanda","logo":"https://www.grandepremio.com.br/wp-content/uploads/2021/01/Circuitos_F1_Holanda_1-300x100.jpg","date":"02-09","dateShow":"02/09","dateType":"2022-09-02T12:00:00.000Z","time":"09h","situation":"Treino Livre 1"},{"isF1":true,"type":"f1","league":"F1","name":"GP da Holanda","logo":"https://www.grandepremio.com.br/wp-content/uploads/2021/01/Circuitos_F1_Holanda_1-300x100.jpg","date":"02-09","dateShow":"02/09","dateType":"2022-09-02T15:00:00.000Z","time":"12h","situation":"Treino Livre 2"},{"isF1":true,"type":"f1","league":"F1","name":"GP da Holanda","logo":"https://www.grandepremio.com.br/wp-content/uploads/2021/01/Circuitos_F1_Holanda_1-300x100.jpg","date":"03-09","dateShow":"03/09","dateType":"2022-09-03T11:00:00.000Z","time":"08h","situation":"Treino Livre 3"},{"isF1":true,"type":"f1","league":"F1","name":"GP da Holanda","logo":"https://www.grandepremio.com.br/wp-content/uploads/2021/01/Circuitos_F1_Holanda_1-300x100.jpg","date":"03-09","dateShow":"03/09","dateType":"2022-09-03T14:00:00.000Z","time":"11h","situation":"Qualifica????o"},{"isF1":true,"type":"f1","league":"F1","name":"GP da Holanda","logo":"https://www.grandepremio.com.br/wp-content/uploads/2021/01/Circuitos_F1_Holanda_1-300x100.jpg","date":"04-09","dateShow":"04/09","dateType":"2022-09-04T13:00:00.000Z","time":"10h","situation":"Corrida"},{"isF1":true,"type":"f1","league":"F1","name":"GP da It??lia","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_Monza_1-1-300x100.jpg","date":"09-09","dateShow":"09/09","dateType":"2022-09-09T12:00:00.000Z","time":"09h","situation":"Treino Livre 1"},{"isF1":true,"type":"f1","league":"F1","name":"GP da It??lia","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_Monza_1-1-300x100.jpg","date":"09-09","dateShow":"09/09","dateType":"2022-09-09T15:00:00.000Z","time":"12h","situation":"Treino Livre 2"},{"isF1":true,"type":"f1","league":"F1","name":"GP da It??lia","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_Monza_1-1-300x100.jpg","date":"10-09","dateShow":"10/09","dateType":"2022-09-10T11:00:00.000Z","time":"08h","situation":"Treino Livre 3"},{"isF1":true,"type":"f1","league":"F1","name":"GP da It??lia","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_Monza_1-1-300x100.jpg","date":"10-09","dateShow":"10/09","dateType":"2022-09-10T14:00:00.000Z","time":"11h","situation":"Qualifica????o"},{"isF1":true,"type":"f1","league":"F1","name":"GP da It??lia","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_Monza_1-1-300x100.jpg","date":"11-09","dateShow":"11/09","dateType":"2022-09-11T13:00:00.000Z","time":"10h","situation":"Corrida"},{"isF1":true,"type":"f1","league":"F1","name":"GP de Singapura","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/05/2019921121522_Mercedes_LewisHamilton_64_DMa-300x200.jpg","date":"30-09","dateShow":"30/09","dateType":"2022-09-30T10:00:00.000Z","time":"07h","situation":"Treino Livre 1"},{"isF1":true,"type":"f1","league":"F1","name":"GP de Singapura","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/05/2019921121522_Mercedes_LewisHamilton_64_DMa-300x200.jpg","date":"30-09","dateShow":"30/09","dateType":"2022-09-30T13:00:00.000Z","time":"10h","situation":"Treino Livre 2"},{"isF1":true,"type":"f1","league":"F1","name":"GP de Singapura","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/05/2019921121522_Mercedes_LewisHamilton_64_DMa-300x200.jpg","date":"01-10","dateShow":"01/10","dateType":"2022-10-01T10:00:00.000Z","time":"07h","situation":"Treino Livre 3"},{"isF1":true,"type":"f1","league":"F1","name":"GP de Singapura","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/05/2019921121522_Mercedes_LewisHamilton_64_DMa-300x200.jpg","date":"01-10","dateShow":"01/10","dateType":"2022-10-01T13:00:00.000Z","time":"10h","situation":"Qualifica????o"},{"isF1":true,"type":"f1","league":"F1","name":"GP de Singapura","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/05/2019921121522_Mercedes_LewisHamilton_64_DMa-300x200.jpg","date":"02-10","dateShow":"02/10","dateType":"2022-10-02T12:00:00.000Z","time":"09h","situation":"Corrida"},{"isF1":true,"type":"f1","league":"F1","name":"GP do Jap??o","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/03/20191013541260_Williams_RobertKubica_71_DMa-300x200.jpg","date":"07-10","dateShow":"07/10","dateType":"2022-10-07T04:00:00.000Z","time":"01h","situation":"Treino Livre 1"},{"isF1":true,"type":"f1","league":"F1","name":"GP do Jap??o","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/03/20191013541260_Williams_RobertKubica_71_DMa-300x200.jpg","date":"07-10","dateShow":"07/10","dateType":"2022-10-07T07:00:00.000Z","time":"04h","situation":"Treino Livre 2"},{"isF1":true,"type":"f1","league":"F1","name":"GP do Jap??o","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/03/20191013541260_Williams_RobertKubica_71_DMa-300x200.jpg","date":"08-10","dateShow":"08/10","dateType":"2022-10-08T04:00:00.000Z","time":"01h","situation":"Treino Livre 3"},{"isF1":true,"type":"f1","league":"F1","name":"GP do Jap??o","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/03/20191013541260_Williams_RobertKubica_71_DMa-300x200.jpg","date":"08-10","dateShow":"08/10","dateType":"2022-10-08T07:00:00.000Z","time":"04h","situation":"Qualifica????o"},{"isF1":true,"type":"f1","league":"F1","name":"GP do Jap??o","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/03/20191013541260_Williams_RobertKubica_71_DMa-300x200.jpg","date":"09-10","dateShow":"09/10","dateType":"2022-10-09T05:00:00.000Z","time":"02h","situation":"Corrida"},{"isF1":true,"type":"f1","league":"F1","name":"GP dos EUA","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_COTA_3-1-300x100.jpg","date":"21-10","dateShow":"21/10","dateType":"2022-10-21T19:00:00.000Z","time":"16h","situation":"Treino Livre 1"},{"isF1":true,"type":"f1","league":"F1","name":"GP dos EUA","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_COTA_3-1-300x100.jpg","date":"21-10","dateShow":"21/10","dateType":"2022-10-21T22:00:00.000Z","time":"19h","situation":"Treino Livre 2"},{"isF1":true,"type":"f1","league":"F1","name":"GP dos EUA","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_COTA_3-1-300x100.jpg","date":"22-10","dateShow":"22/10","dateType":"2022-10-22T19:00:00.000Z","time":"16h","situation":"Treino Livre 3"},{"isF1":true,"type":"f1","league":"F1","name":"GP dos EUA","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_COTA_3-1-300x100.jpg","date":"22-10","dateShow":"22/10","dateType":"2022-10-22T22:00:00.000Z","time":"19h","situation":"Qualifica????o"},{"isF1":true,"type":"f1","league":"F1","name":"GP dos EUA","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_COTA_3-1-300x100.jpg","date":"23-10","dateShow":"23/10","dateType":"2022-10-23T19:00:00.000Z","time":"16h","situation":"Corrida"},{"isF1":true,"type":"f1","league":"F1","name":"GP do M??xico","logo":"https://www.grandepremio.com.br/wp-content/uploads/2021/01/Circuitos_F1_Mexico_1-300x100.jpg","date":"28-10","dateShow":"28/10","dateType":"2022-10-28T17:00:00.000Z","time":"14h","situation":"Treino Livre 1"},{"isF1":true,"type":"f1","league":"F1","name":"GP do M??xico","logo":"https://www.grandepremio.com.br/wp-content/uploads/2021/01/Circuitos_F1_Mexico_1-300x100.jpg","date":"28-10","dateShow":"28/10","dateType":"2022-10-28T20:00:00.000Z","time":"17h","situation":"Treino Livre 2"},{"isF1":true,"type":"f1","league":"F1","name":"GP do M??xico","logo":"https://www.grandepremio.com.br/wp-content/uploads/2021/01/Circuitos_F1_Mexico_1-300x100.jpg","date":"29-10","dateShow":"29/10","dateType":"2022-10-29T17:00:00.000Z","time":"14h","situation":"Treino Livre 3"},{"isF1":true,"type":"f1","league":"F1","name":"GP do M??xico","logo":"https://www.grandepremio.com.br/wp-content/uploads/2021/01/Circuitos_F1_Mexico_1-300x100.jpg","date":"29-10","dateShow":"29/10","dateType":"2022-10-29T20:00:00.000Z","time":"17h","situation":"Qualifica????o"},{"isF1":true,"type":"f1","league":"F1","name":"GP do M??xico","logo":"https://www.grandepremio.com.br/wp-content/uploads/2021/01/Circuitos_F1_Mexico_1-300x100.jpg","date":"30-10","dateShow":"30/10","dateType":"2022-10-30T19:00:00.000Z","time":"16h","situation":"Corrida"},{"isF1":true,"type":"f1","league":"F1","name":"GP de S??o Paulo","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_Interlagos_3-1-300x100.jpg","date":"11-11","dateShow":"11/11","dateType":"2022-11-11T15:30:00.000Z","time":"12h30","situation":"Treino Livre 1"},{"isF1":true,"type":"f1","league":"F1","name":"GP de S??o Paulo","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_Interlagos_3-1-300x100.jpg","date":"11-11","dateShow":"11/11","dateType":"2022-11-11T19:00:00.000Z","time":"16h","situation":"Qualifica????o"},{"isF1":true,"type":"f1","league":"F1","name":"GP de S??o Paulo","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_Interlagos_3-1-300x100.jpg","date":"12-11","dateShow":"12/11","dateType":"2022-11-12T15:30:00.000Z","time":"12h30","situation":"Treino Livre 2"},{"isF1":true,"type":"f1","league":"F1","name":"GP de S??o Paulo","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_Interlagos_3-1-300x100.jpg","date":"12-11","dateShow":"12/11","dateType":"2022-11-12T19:30:00.000Z","time":"16h30","situation":"Sprint"},{"isF1":true,"type":"f1","league":"F1","name":"GP de S??o Paulo","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_Interlagos_3-1-300x100.jpg","date":"13-11","dateShow":"13/11","dateType":"2022-11-13T18:00:00.000Z","time":"15h","situation":"Corrida"},{"isF1":true,"type":"f1","league":"F1","name":"GP de Abu Dhabi","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_AbuDhabi_1-1-300x100.jpg","date":"18-11","dateShow":"18/11","dateType":"2022-11-18T10:00:00.000Z","time":"07h","situation":"Treino Livre 1"},{"isF1":true,"type":"f1","league":"F1","name":"GP de Abu Dhabi","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_AbuDhabi_1-1-300x100.jpg","date":"18-11","dateShow":"18/11","dateType":"2022-11-18T13:00:00.000Z","time":"10h","situation":"Treino Livre 2"},{"isF1":true,"type":"f1","league":"F1","name":"GP de Abu Dhabi","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_AbuDhabi_1-1-300x100.jpg","date":"19-11","dateShow":"19/11","dateType":"2022-11-19T11:00:00.000Z","time":"08h","situation":"Treino Livre 3"},{"isF1":true,"type":"f1","league":"F1","name":"GP de Abu Dhabi","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_AbuDhabi_1-1-300x100.jpg","date":"19-11","dateShow":"19/11","dateType":"2022-11-19T14:00:00.000Z","time":"11h","situation":"Qualifica????o"},{"isF1":true,"type":"f1","league":"F1","name":"GP de Abu Dhabi","logo":"https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_AbuDhabi_1-1-300x100.jpg","date":"20-11","dateShow":"20/11","dateType":"2022-11-20T13:00:00.000Z","time":"10h","situation":"Corrida"}]
    
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

module.exports = {
	get: (req, res) => {

        (async function () {

            let gamesNow = [],
                gamesDate = []

            gamesNow = gamesNow.concat(await makeSoccer());
            gamesNow = gamesNow.concat(await makeNBA());
            gamesNow = gamesNow.concat(makeF1());
            
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