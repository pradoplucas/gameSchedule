showAllRadio()

function showAllRadio(){
    let allGames = document.getElementsByClassName('oneGame')

    for(oneGame of allGames) oneGame.classList.remove('d-none')

}

function changeRadio(value){
    let allGames = document.getElementsByClassName('oneGame')

    for(oneGame of allGames){
        if(oneGame.className.split(' ')[0] == value) oneGame.classList.remove('d-none')
        else oneGame.classList.add('d-none')
    }
}

function changeTheme(value){
    let allToggles = document.getElementsByClassName('toggleTheme')

    const toggleValues = value ? ['light', 'dark'] : ['dark', 'light'];

	for (oneToggle of allToggles) {
		oneToggle.classList.add(toggleValues[0]);
		oneToggle.classList.remove(toggleValues[1]);
	}
}