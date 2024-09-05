const pokemonDetails = document.getElementById('pokemonDetails');
const searchInput = document.getElementById('searchInput');
const evolutionContainer = document.getElementById('evolutionContainer');
const typeDetails = document.getElementById('typeDetails');

// Função para buscar um Pokémon pelo nome ou ID
async function searchPokemon() {
    const query = searchInput.value.toLowerCase();
    if (!query) return;

    const url = `https://pokeapi.co/api/v2/pokemon/${query}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            alert('Pokémon não encontrado!');
            return;
        }
        const pokemon = await response.json();
        displayPokemonDetails(pokemon);
        fetchEvolutionChain(pokemon.species.url);
        fetchTypeDetails(pokemon.types);
    } catch (error) {
        console.error('Erro ao buscar dados do Pokémon:', error);
        alert('Ocorreu um erro ao buscar os dados do Pokémon.');
    }
}

// Função para exibir os detalhes do Pokémon
function displayPokemonDetails(pokemon) {
    pokemonDetails.innerHTML = `
        <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
        <h3>${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h3>
        <p><span class="stat">ID:</span> ${pokemon.id}</p>
        <p><span class="stat">Altura:</span> ${pokemon.height / 10} m</p>
        <p><span class="stat">Peso:</span> ${pokemon.weight / 10} kg</p>
        <p><span class="stat">Tipo:</span> ${pokemon.types.map(type => type.type.name).join(', ')}</p>
    `;
}

// Função para buscar a cadeia de evolução
async function fetchEvolutionChain(speciesUrl) {
    try {
        const speciesResponse = await fetch(speciesUrl);
        const speciesData = await speciesResponse.json();
        const evolutionUrl = speciesData.evolution_chain.url;

        const evolutionResponse = await fetch(evolutionUrl);
        const evolutionData = await evolutionResponse.json();

        displayEvolutionChain(evolutionData.chain);
    } catch (error) {
        console.error('Erro ao buscar cadeia de evolução:', error);
        alert('Ocorreu um erro ao buscar a cadeia de evolução.');
    }
}

// Função para exibir a cadeia de evolução
function displayEvolutionChain(chain) {
    evolutionContainer.innerHTML = '<h4>Evoluções:</h4>';
    
    let currentEvolution = chain;

    do {
        fetchEvolutionDetails(currentEvolution.species.name);
        currentEvolution = currentEvolution.evolves_to[0];
    } while (currentEvolution);
}

// Função para buscar e exibir detalhes de cada evolução
async function fetchEvolutionDetails(name) {
    const url = `https://pokeapi.co/api/v2/pokemon/${name}`;
    try {
        const response = await fetch(url);
        const pokemon = await response.json();

        const evolutionImage = document.createElement('img');
        evolutionImage.src = pokemon.sprites.front_default;
        evolutionImage.alt = pokemon.name;

        evolutionContainer.appendChild(evolutionImage);
    } catch (error) {
        console.error(`Erro ao buscar dados da evolução ${name}:`, error);
    }
}

// Função para buscar e exibir as fraquezas, resistências e imunidades do Pokémon
async function fetchTypeDetails(types) {
    try {
        const typeUrls = types.map(typeInfo => typeInfo.type.url);
        const typeResponses = await Promise.all(typeUrls.map(url => fetch(url)));
        const typeDataArray = await Promise.all(typeResponses.map(response => response.json()));

        let weaknesses = new Set();
        let resistances = new Set();
        let immunities = new Set();

        typeDataArray.forEach(typeData => {
            typeData.damage_relations.double_damage_from.forEach(type => weaknesses.add(type.name));
            typeData.damage_relations.half_damage_from.forEach(type => resistances.add(type.name));
            typeData.damage_relations.no_damage_from.forEach(type => immunities.add(type.name));
        });

        // Remover resistências e imunidades das fraquezas
        resistances.forEach(resistance => weaknesses.delete(resistance));
        immunities.forEach(immunity => weaknesses.delete(immunity));

        displayTypeDetails(weaknesses, resistances, immunities);
    } catch (error) {
        console.error('Erro ao buscar detalhes dos tipos:', error);
        alert('Ocorreu um erro ao buscar as informações de tipo.');
    }
}

// Função para exibir as fraquezas, resistências e imunidades
function displayTypeDetails(weaknesses, resistances, immunities) {
    typeDetails.innerHTML = `
        <h4>Fraquezas:</h4>
        <p>${weaknesses.size > 0 ? Array.from(weaknesses).join(', ') : 'Nenhuma'}</p>
        <h4>Resistências:</h4>
        <p>${resistances.size > 0 ? Array.from(resistances).join(', ') : 'Nenhuma'}</p>
        <h4>Imunidades:</h4>
        <p>${immunities.size > 0 ? Array.from(immunities).join(', ') : 'Nenhuma'}</p>
    `;
}


