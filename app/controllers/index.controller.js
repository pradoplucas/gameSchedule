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
                        situation: oneMatch.fase + ' ' + (oneMatch.rodada + 1)
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

    let allInfo = [{name: 'GP da Emília-Romanha',sexta: '22/04/2022@8h30 às 9h30 – Treino Livre 1&12h às 13h – Qualificação',sabado: '23/04/2022@7h30 às 8h30 – Treino Livre 2&11h30 – Sprint',domingo: '24/04/2022@10h – Corrida',logo: 'https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_SanMarino_2-300x100.jpg'},{name: 'GP de Miami',sexta: '06/05/2022@15h30 às 16h30 – Treino Livre 1&18h30 às 19h30 – Treino Livre 2',sabado: '07/05/2022@14h às 15h – Treino Livre 3&17h às 18h – Qualificação',domingo: '08/05/2022@16h30 – Corrida',logo: 'https://www.grandepremio.com.br/wp-content/uploads/2021/12/Circuitos_F1_Miami_1-300x100.jpg'},{name: 'GP da Espanha',sexta: '20/05/2022@9h às 10h – Treino Livre 1&12h às 13h – Treino Livre 2',sabado: '21/05/2022@8h às 9h – Treino Livre 3&11h às 12h – Qualificação',domingo: '22/05/2022@10h – Corrida',logo: 'https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_Barcelona_3-1-300x100.jpg'},{name: 'GP de Mônaco',sexta: '27/05/2022@9h às 10h – Treino Livre 1&12h às 13h – Treino Livre 2',sabado: '28/05/2022@8h às 9h – Treino Livre 3&11h às 12h – Qualificação',domingo: '29/05/2022@10h – Corrida',logo: 'https://www.grandepremio.com.br/wp-content/uploads/2021/01/Circuitos_F1_Monaco_1-300x100.jpg'},{name: 'GP do Azerbaijão',sexta: '10/06/2022@9h às 10h – Treino Livre 1&12h às 13h – Treino Livre 2',sabado: '11/06/2022@8h às 9h – Treino Livre 3&11h às 12h – Qualificação',domingo: '12/06/2022@8h – Corrida',logo: 'https://www.grandepremio.com.br/wp-content/uploads/2021/01/Circuitos_F1_Azerbaijao_1-300x100.jpg'},{name: 'GP do Canadá',sexta: '17/06/2022@15h às 16h – Treino Livre 1&18h às 19h – Treino Livre 2',sabado: '18/06/2022@14h às 15h – Treino Livre 3&17h às 18h – Qualificação',domingo: '19/06/2022@15h – Corrida',logo: 'https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_GillesVilleneuve_2-1-300x100.jpg'},{name: 'GP da Inglaterra',sexta: '01/07/2022@9h às 10h – Treino Livre 1&12h às 13h – Treino Livre 2',sabado: '02/07/2022@8h às 9h – Treino Livre 3&11h às 12h – Qualificação',domingo: '03/07/2022@11h – Corrida',logo: 'https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_Siverstone_3-300x100.jpg'},{name: 'GP da Áustria',sexta: '08/07/2022@8h30 às 9h30 – Treino Livre 1&12h às 13h – Qualificação',sabado: '09/07/2022@7h30 às 8h30 – Treino Livre 2&11h30 – Sprint',domingo: '10/07/2022@10h – Corrida',logo: 'https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_RedBullRing_2-300x100.jpg'},{name: 'GP da França',sexta: '22/07/2022@9h às 10h – Treino Livre 1&12h às 13h – Treino Livre 2',sabado: '23/07/2022@8h às 9h – Treino Livre 3&11h às 12h – Qualificação',domingo: '24/07/2022@10h – Corrida',logo: 'https://www.grandepremio.com.br/wp-content/uploads/2021/01/Circuitos_F1_Franca_1-300x100.jpg'},{name: 'GP da Hungria',sexta: '29/07/2022@9h às 10h – Treino Livre 1&12h às 13h – Treino Livre 2',sabado: '30/07/2022@8h às 9h – Treino Livre 3&11h às 12h – Qualificação',domingo: '31/07/2022@10h – Corrida',logo: 'https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_Hungaroring_2-1-300x100.jpg'},{name: 'GP da Bélgica',sexta: '26/08/2022@9h às 10h – Treino Livre 1&12h às 13h – Treino Livre 2',sabado: '27/08/2022@8h às 9h – Treino Livre 3&11h às 12h – Qualificação',domingo: '28/08/2022@10h – Corrida',logo: 'https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_Spa_3-300x100.jpg'},{name: 'GP da Holanda',sexta: '02/09/2022@9h às 10h – Treino Livre 1&12h às 13h – Treino Livre 2',sabado: '03/09/2022@8h às 9h – Treino Livre 3&11h às 12h – Qualificação',domingo: '04/09/2022@10h – Corrida',logo: 'https://www.grandepremio.com.br/wp-content/uploads/2021/01/Circuitos_F1_Holanda_1-300x100.jpg'},{name: 'GP da Itália',sexta: '09/09/2022@9h às 10h – Treino Livre 1&12h às 13h – Treino Livre 2',sabado: '10/09/2022@8h às 9h – Treino Livre 3&11h às 12h – Qualificação',domingo: '11/09/2022@10h – Corrida',logo: 'https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_Monza_1-1-300x100.jpg'},{name: 'GP de Singapura',sexta: '30/09/2022@7h às 8h – Treino Livre 1&10h às 11h – Treino Livre 2',sabado: '01/10/2022@7h às 8h – Treino Livre 3&10h às 11h – Qualificação',domingo: '02/10/2022@9h – Corrida',logo: 'https://www.grandepremio.com.br/wp-content/uploads/2020/05/2019921121522_Mercedes_LewisHamilton_64_DMa-300x200.jpg'},{name: 'GP do Japão',sexta: '07/10/2022@1h às 2h – Treino Livre 1&4h às 5h – Treino Livre 2',sabado: '08/10/2022@1h às 2h – Treino Livre 3&4h às 5h – Qualificação',domingo: '09/10/2022@2h – Corrida',logo: 'https://www.grandepremio.com.br/wp-content/uploads/2020/03/20191013541260_Williams_RobertKubica_71_DMa-300x200.jpg'},{name: 'GP dos EUA',sexta: '21/10/2022@16h às 17h – Treino Livre 1&19h às 20h – Treino Livre 2',sabado: '22/10/2022@16h às 17h – Treino Livre 3&19h às 20h – Qualificação',domingo: '23/10/2022@16h – Corrida',logo: 'https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_COTA_3-1-300x100.jpg'},{name: 'GP do México',sexta: '28/10/2022@14h às 15h – Treino Livre 1&17h às 18h – Treino Livre 2',sabado: '29/10/2022@14h às 15h – Treino Livre 3&17h às 18h – Qualificação',domingo: '30/10/2022@16h – Corrida',logo: 'https://www.grandepremio.com.br/wp-content/uploads/2021/01/Circuitos_F1_Mexico_1-300x100.jpg'},{name: 'GP de São Paulo',sexta: '11/11/2022@12h30 às 13h30 – Treino Livre 1&16h às 17h – Qualificação',sabado: '12/11/2022@12h30 às 13h30 – Treino Livre 2&16h30 – Sprint',domingo: '13/11/2022@15h – Corrida',logo: 'https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_Interlagos_3-1-300x100.jpg'},{name: 'GP de Abu Dhabi',sexta: '18/11/2022@7h às 8h – Treino Livre 1&10h às 11h – Treino Livre 2',sabado: '19/11/2022@8h às 9h – Treino Livre 3&11h às 12h – Qualificação',domingo: '20/11/2022@10h – Corrida',logo: 'https://www.grandepremio.com.br/wp-content/uploads/2020/07/Circuitos_F1_AbuDhabi_1-1-300x100.jpg'}]

    let allDays = ['sexta', 'sabado', 'domingo'],
        newInfos = []

     for(oneInfo of allInfo){
        
        for(oneDay of allDays){
            let datePartOne = oneInfo[oneDay].split('@')[0].split('/'),
                infoDetails = oneInfo[oneDay].split('@')[1].split('&')

            for(oneInfoDetail of infoDetails){
                let timeAux = oneInfoDetail.split('–')[0].split(' às')[0].trim(),
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
                        
                        situation: oneInfoDetail.split('–')[1].trim()
                    })
                }
            }
        }
    }

    return newInfos

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