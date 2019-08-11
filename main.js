/* TO DO
- add lines to show how pokemon evolve
- search for pokemon
- track pokemons
- change between sprites: https://pokemondb.net/sprites/bulbasaur
*/

document.addEventListener('DOMContentLoaded', () => {

    let axisFilter = 'attack'

    function makeScales(axisFilter, data) {
        let values = []
        data.forEach(d => {
            values.push(d[axisFilter])
        })
        let min = Math.min(...values)
        let max = Math.max(...values)
        let uniques = values.filter((item, i, ar) => ar.indexOf(item) === i);

        if (axisFilter === 'is_legendary') {
            return {
                'x': d3.scaleLinear().range([padding, width - margin]).domain([-1, max + 1]),
                'y': d3.scaleLinear().range([height - padding, padding]).domain([-1, max + 1]),
                'r': d3.scaleLinear().range([spriteSize * 0.75, spriteSize * 1.5]).domain([min, max]),
                'c': d3.scaleOrdinal(d3.schemeCategory10)
            }
        } else if (axisFilter === 'generation') {
            return {
                'x': d3.scaleBand().rangeRound([padding, width - margin]).domain(uniques),
                'y': d3.scaleLinear().range([height - padding, padding]).domain([0, max + 1]),
                'r': d3.scaleLinear().range([spriteSize * 0.75, spriteSize * 1.5]).domain([min, max]),
                'c': d3.scaleSequential(d3.interpolatePlasma).domain([0, max])
            }
        } else if ((axisFilter === 'type1') || (axisFilter === 'type2')) {
            let i = Array.from(Array(uniques.length).keys())
            return {
                'x': d3.scaleBand().rangeRound([padding, width - margin]).domain(uniques.sort()),
                'y': d3.scaleBand().rangeRound([height - padding, padding]).domain(uniques.sort()),
                'r': d3.scaleLinear().range([spriteSize, spriteSize]).domain([spriteSize, spriteSize]),
                'c': d3.scaleOrdinal(d3.schemeCategory10)
            }
        } else {
            return {
                'x': d3.scaleLinear().range([padding, width - margin]).domain([0, max + 1]),
                'y': d3.scaleLinear().range([height - padding, padding]).domain([0, max + 1]),
                'r': d3.scaleLinear().range([spriteSize * 0.75, spriteSize * 1.5]).domain([min, max]),
                'c': d3.scaleSequential(d3.interpolatePlasma).domain([0, max + 1])
            }
        }
    }

    ///////////////////////
    // SET UP BUTTONS
    ///////////////////////

    let stats = [
        'attack', 'defense', 'sp_attack', 'sp_defense', 'speed', 'hp',
        'weight_kg', 'height_m', 'is_legendary', 'generation', 'type1', 'type2',
        'base_total', 'base_egg_steps', 'against_dragon', 'against_fairy', 'experience_growth'
    ]

    let dropdown = {
        'x': document.getElementById('select-x-axis'),
        'y': document.getElementById('select-y-axis')
    }

    stats.forEach(stat => {
        dropdown.x.innerHTML += `<option value="${stat}">${stat}</option>`
        dropdown.y.innerHTML += `<option value="${stat}">${stat}</option>`
    })

    ///////////////////////
    // D3
    ///////////////////////

    let width = window.innerWidth,
        height = window.innerHeight * 0.75 //* 2
        margin = 200,
        padding = 20,
        radius = 4;
        spriteSize = 30

    let svg = d3.select('.canvas').append('svg')
        .attr('width', width - margin)
        .attr('height', height)

    d3.json('pokemon.json', function (data) {

        ///////////////////////
        // D3 ON LOAD
        ///////////////////////

        let scales = makeScales(axisFilter, data)

        // AXES
        svg.append("g")
            .classed('x-scale', true)
            .attr("transform", `translate(0, ${height - padding})`)
            .call(d3.axisBottom(scales.x))
        svg.append("g")
            .classed('y-scale', true)
            .attr("transform", `translate(${padding}, 0)`)
            .call(d3.axisLeft(scales.y))

        // LABELS
        svg.append('text')
            .classed('axis-label x-axis-label', true)
            .text(axisFilter.toUpperCase())
            .attr('x', width / 2 - padding)
            .attr('y', height - 2)
        svg.append('text')
            .classed('axis-label y-axis-label', true)
            .text('defense'.toUpperCase())
            .attr('x', padding + 50)
            .attr('y', height / 2)

        // BEES
        svg.selectAll('image')
            .data(data)
            .enter().append('image').classed('sprite', true)
            .attr('width', spriteSize)
            .attr('height', spriteSize)
            // .attr('xlink:href', function (d) { return `https://img.pokemondb.net/sprites/red-blue/normal/${d.name.toLowerCase()}.png` })
            .attr('xlink:href', function (d) { return `https://img.pokemondb.net/sprites/sun-moon/icon/${d.name.toLowerCase()}.png`})
            .attr('x', (d) => { return scales.x(d[axisFilter]) })
            .attr('y', (d) => { return scales.y(d['defense']) })
            .on('mouseover', function (d) {
                // Guidelines
                svg.append('line')
                    .classed('pokemon-name', true)
                    .attr('x1', padding)
                    .attr('x2', scales.x(d[axisFilter]))
                    .attr('y1', scales.y(d['defense']))
                    .attr('y2', scales.y(d['defense']))
                    .attr('stroke', 'black')
                    .attr('stroke-opacity', 0.2)
                svg.append('line')
                    .classed('pokemon-name', true)
                    .attr('x1', scales.x(d[axisFilter]))
                    .attr('x2', scales.x(d[axisFilter]))
                    .attr('y1', height - padding)
                    .attr('y2', scales.y(d['defense']))
                    .attr('stroke', 'black')
                    .attr('stroke-opacity', 0.2)

                // Tool Tip
                svg.append('rect')
                    .classed('pokemon-name', true)
                    .attr('fill', 'floralwhite')
                    .attr('width', 100)
                    .attr('height', 20)
                    .attr('opacity', 0.8)
                    .attr('rx', 5)
                    .attr('x', this.getAttribute('x') + (spriteSize / 2) * 3)
                    .attr('y', this.getAttribute('y') - 15)
                svg.append('text')
                    .classed('pokemon-name', true)
                    .text(d.name)
                    .attr('x', this.getAttribute('x') + (spriteSize / 2) * 3)
                    .attr('y', this.getAttribute('y'))
                
                // Link
                let pokemon = document.getElementById('pokemon')
                pokemon.innerHTML = `<a href="http://pokemondb.net/pokedex/${d.name.toLowerCase()}"><img src="https://img.pokemondb.net/sprites/sun-moon/icon/${d.name.toLowerCase()}.png" alt="${d.name}"></a>`
            })
            .on('mouseout', (d) => {
                svg.selectAll('.pokemon-name')
                    .remove()
            })
        // svg.selectAll('.circ')
        //     .data(data)
        //     .enter().append('circle').classed('circ', true)
        //     .attr('r', radius)
        //     .attr('cx', (d) => { return scales.x(d[axisFilter]); })
        //     .attr('cy', (d) => { return scales.y(d['defense']); })
        //     .attr('fill', (d) => { return scales.c(d[axisFilter]) })
        //     .on('mouseover', function (d) {
        //         svg.append('text')
        //             .classed('pokemon-name', true)
        //             .text(d.name)
        //             .attr('x', this.getAttribute('cx'))
        //             .attr('y', this.getAttribute('cy') - 10)
        //         let pokemon = document.getElementById('pokemon')
        //         pokemon.innerHTML = `<a href="http://pokemondb.net/pokedex/${d.name.toLowerCase()}"><img src="https://img.pokemondb.net/sprites/sun-moon/icon/${d.name.toLowerCase()}.png" alt="${d.name}"></a>`
        //     })
        //     .on('mouseout', (d) => {
        //         svg.selectAll('.pokemon-name')
        //             .remove()
        //     })
        //     .on('click', function (d) {
        //         svg.selectAll('.circ')
        //             .style('stroke-width', 0)
        //         let circ = d3.select(this)
        //         circ.style('stroke', 'black')
        //             .style('stroke-width', 3)
        //         console.log('https://bulbapedia.bulbagarden.net/wiki/' + d.name + '_(Pok%C3%A9mon))')
        //     })

        // SWARM
        function tick() {
            d3.selectAll('.circ')
                .attr('cx', function (d) { return d.x })
                .attr('cy', function (d) { return d.y })
            d3.selectAll('.sprite')
                .attr('x', function (d) { return d.x })
                .attr('y', function (d) { return d.y })
        }

        let simulation = d3.forceSimulation(data)
            .force('x', d3.forceX(function (d) {
                return scales.x(d[axisFilter])
            }).strength(0.99))
            .force('y', d3.forceY(function (d) {
                return scales.y(d['defense'])
            }).strength(0.99))
            .force('collide', d3.forceCollide(10))
            .alphaDecay(0)
            .alpha(0.12)
            .on('tick', tick)

        let init_decay;
        init_decay = setTimeout(function () {
            console.log('init alpha decay')
            simulation.alphaDecay(0.1);
        }, 8000);

        ///////////////////////
        // D3 NEW X-AXIS
        ///////////////////////

        dropdown.x.addEventListener('change', e => {
            axisFilter = dropdown.x.value
            let scales = makeScales(axisFilter, data)

            d3.select('.x-scale')
                .transition()
                .call(d3.axisBottom(scales.x))

            d3.select('.x-axis-label')
                .transition()
                .text(axisFilter.toUpperCase())

            simulation.force('x', d3.forceX(function (d) {
                return scales.x(d[axisFilter])
            }))

            d3.selectAll('.circ')
                .transition()
                .attr('fill', (d) => { return scales.c(d[axisFilter]) })
            // d3.selectAll('.sprite')
            //     .transition()
            //     .attr('width', (d) => { return scales.r(d[axisFilter]) })
            //     .attr('height', (d) => { return scales.r(d[axisFilter]) })

            simulation
                .alphaDecay(0)
                .alpha(0.12)
                .restart()

            clearTimeout(init_decay);

            init_decay = setTimeout(function () {
                console.log('init alpha decay');
                simulation.alphaDecay(0.1);
            }, 8000);
        })

        ///////////////////////
        // D3 NEW Y-AXIS
        ///////////////////////

        dropdown.y.addEventListener('change', e => {

            axisFilter = dropdown.y.value
            let scales = makeScales(axisFilter, data)

            d3.select('.y-scale')
                .transition()
                .call(d3.axisLeft(scales.y))

            d3.select('.y-axis-label')
                .transition()
                .text(axisFilter.toUpperCase())

            d3.selectAll('.circ')
                .transition()
                .attr('fill', (d) => { return scales.c(d[axisFilter]) })

            simulation.force('y', d3.forceY(function (d) {
                return scales.y(d[axisFilter])
            }))

            simulation
                .alphaDecay(0)
                .alpha(0.12)
                .restart()

            clearTimeout(init_decay);

            init_decay = setTimeout(function () {
                console.log('init alpha decay');
                simulation.alphaDecay(0.1);
            }, 8000);
        })

    })


})
