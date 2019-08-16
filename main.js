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
                'x': d3.scaleBand().rangeRound(xRange).domain(uniques),
                'y': d3.scaleBand().rangeRound(yRange).domain(uniques),
                'r': d3.scaleLinear().range([spriteSize * 0.75, spriteSize * 1.5]).domain([min, max]),
                'c': d3.scaleOrdinal(d3.schemeCategory10),
                'offsetScaleBandx': ((width - padding) / uniques.length) / 2,
                'offsetScaleBandy': ((height - padding) / uniques.length) / 2
                // 'offsetScaleBandy': 
            }
        } else if (axisFilter === 'generation') {
            return {
                'x': d3.scaleBand().rangeRound(xRange).domain(uniques),
                'y': d3.scaleBand().rangeRound(yRange).domain(uniques),
                'r': d3.scaleLinear().range([spriteSize * 0.75, spriteSize * 1.5]).domain([min, max]),
                'c': d3.scaleSequential(d3.interpolatePlasma).domain([0, max]),
                'offsetScaleBandx': ((width - padding) / uniques.length) / 2,
                'offsetScaleBandy': ((height - padding) / uniques.length) / 2
            }
        } else if ((axisFilter === 'type1') || (axisFilter === 'type2')) {
            let i = Array.from(Array(uniques.length).keys())
            return {
                'x': d3.scaleBand().rangeRound(xRange).domain(uniques.sort()),
                'y': d3.scaleBand().rangeRound(yRange).domain(uniques.sort()),
                'r': d3.scaleLinear().range([spriteSize, spriteSize]).domain([spriteSize, spriteSize]),
                'c': d3.scaleOrdinal(d3.schemeCategory10),
                'offsetScaleBandx': ((width - padding) / uniques.length) / 2,
                'offsetScaleBandy': ((height - padding) / uniques.length) / 2
            }
        } else {
            return {
                'x': d3.scaleLinear().range(xRange).domain([0, max + (max * 0.05)]),
                'y': d3.scaleLinear().range(yRange).domain([0, max + (max * 0.05)]),
                'r': d3.scaleLinear().range([spriteSize * 0.75, spriteSize * 1.5]).domain([min, max]),
                'c': d3.scaleSequential(d3.interpolatePlasma).domain([0, max + 1]),
                'offsetScaleBandx': 0,
                'offsetScaleBandy': 0
            }
        }
    }

    ///////////////////////
    // SET UP BUTTONS
    ///////////////////////

    const stats = [
        'attack', 'defense', 'sp_attack', 'sp_defense', 'speed', 'hp',
        'weight_kg', 'height_m', 'is_legendary', 'generation', 'type1', 'type2',
        'base_total', 'base_egg_steps', 'experience_growth'
    ]

    const statMap = {
        'attack' : 'Attack',
        'defense' : 'Defence',
        'sp_attack' : 'Special Attack',
        'sp_defense' : 'Special Defence',
        'speed' : 'Speed',
        'hp' : 'HP',
        'base_total' : 'Base Total',
        'base_egg_steps' : 'Base Egg Steps',
        'experience_growth' : 'Experience Growth',
        'weight_kg' : 'Weight (Kg)',
        'height_m' : 'Height (m)',
        'type1' : 'Primary Type',
        'type2' : 'Secondary Type',
        'is_legendary' : 'Is Legendary?',
        'generation' : 'Generation'
         
    }

    let dropdown = {
        'x': document.getElementById('select-x-axis'),
        'y': document.getElementById('select-y-axis')
    }

    stats.forEach(stat => {
        dropdown.x.innerHTML += `<option value="${stat}">${statMap[stat]}</option>`
        dropdown.y.innerHTML += `<option value="${stat}">${statMap[stat]}</option>`
    })

    ///////////////////////
    // D3
    ///////////////////////

    let width = window.innerWidth,
        height = window.innerHeight, //* 2
        margin = 0,
        padding = 50,
        radius = 4,
        spriteSize = 30,
        xRange = [padding * 2, width - (padding * 2)],
        yRange = [height - padding, padding]


    let svg = d3.select('.canvas').append('svg')
        .attr('width', width)
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
            .call(d3.axisBottom(scales.x).tickSize(-(height - (padding * 2))))
            .attr('visibility', 'hidden')
        svg.append("g")
            .classed('y-scale', true)
            .attr("transform", `translate(${padding * 2}, 0)`)
            .call(d3.axisLeft(scales.y).tickSize(-(width - (padding * 4))))
            .attr('visibility', 'hidden')
        
        // LABELS
        svg.append('text')
            .classed('axis-label x-axis-label', true)
            .text(statMap[axisFilter].toUpperCase())
            .attr('x', width / 2 - padding)
            .attr('y', height - 2)
            .attr('visibility', 'hidden')
        svg.append('text')
            .classed('axis-label y-axis-label', true)
            .text('defense'.toUpperCase())
            .attr('x', padding)
            .attr('y', height / 2)
            .attr('transform', `rotate(270,${padding},${height / 2})`)
            .attr('visibility', 'hidden')

        // BEES
        svg.selectAll('image')
            .data(data)
            .enter().append('image').classed('sprite', true)
            .attr('width', spriteSize)
            .attr('height', spriteSize)
            // .attr('xlink:href', function (d) { return `https://img.pokemondb.net/sprites/red-blue/normal/${d.name.toLowerCase()}.png` })
            .attr('xlink:href', function (d) { return `./pokemon/${d.name.toLowerCase()}.png`})
            .attr('x', (d) => { return scales.x(d[axisFilter]) + scales.offsetScaleBandx })
            .attr('y', (d) => { return scales.y(d['defense']) + scales.offsetScaleBandy })
            .on('mouseover', function (d) {
                // Guidelines
                // svg.append('line')
                //     .classed('pokemon-name', true)
                //     .attr('x1', padding)
                //     .attr('x2', scales.x(d[axisFilter]))
                //     .attr('y1', scales.y(d['defense']))
                //     .attr('y2', scales.y(d['defense']))
                //     .attr('stroke', 'black')
                //     .attr('stroke-opacity', 0.2)
                // svg.append('line')
                //     .classed('pokemon-name', true)
                //     .attr('x1', scales.x(d[axisFilter]))
                //     .attr('x2', scales.x(d[axisFilter]))
                //     .attr('y1', height - padding)
                //     .attr('y2', scales.y(d['defense']))
                //     .attr('stroke', 'black')
                //     .attr('stroke-opacity', 0.2)

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
                return width / 2
            }).strength(0.4))
            .force('y', d3.forceY(function (d) {
                return height / 2
            }).strength(0.4))
            .force('collide', d3.forceCollide(10))
            .alphaDecay(0.1)
            .alpha(0.4)
            .on('tick', tick)

        let init_decay;
        init_decay = setTimeout(function () {
            console.log('init alpha decay')
            simulation.alphaDecay(0.01);
        }, 4000);

        // let collisionChange = document.getElementById('collision-change')
        // collisionChange.addEventListener('input', e => {
        //     simulation
        //         .force('collide', d3.forceCollide(collisionChange.value))
        //         .restart()
        // })

        ///////////////////////
        // D3 NEW X-AXIS
        ///////////////////////

        dropdown.x.addEventListener('change', e => {

            axisFilter = dropdown.x.value
            
            if (axisFilter !== 'disabled') {
                    
                let scales = makeScales(axisFilter, data)

                d3.select('.x-scale')
                    .transition()
                    .duration(400)
                    .call(d3.axisBottom(scales.x).tickSize(-(height - (padding * 2))))
                    // .attr('fill', 'orangered')
                    .attr('visibility', 'visible')
                    .attr('stroke', 'orangered')
                    .attr('opacity', 0.5)
                        .transition()
                        .duration(400)
                        .attr('fill', 'none')
                        .attr('stroke', 'none')
                    

                d3.select('.x-axis-label')
                    .transition()
                    .duration(200)
                    .text(statMap[axisFilter].toUpperCase())
                    .attr('visibility', 'visible')
                    .attr('fill', 'orangered')
                    .attr('stroke', 'orangered')
                    .attr('stroke-width', '5px')
                        .transition()
                        .duration(200)
                        .attr('fill', 'black')
                        .attr('stroke-width', '0px')


                simulation.force('x', d3.forceX(function (d) {
                    return scales.x(d[axisFilter]) + scales.offsetScaleBandx
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
                    .alpha(0.4)
                    .restart()

                clearTimeout(init_decay);

                init_decay = setTimeout(function () {
                    console.log('init alpha decay');
                    simulation.alphaDecay(0.1);
                }, 4000);

            } else {
                d3.select('.x-scale')
                    .transition(400)
                    .attr('visibility', 'hidden')
                d3.select('.x-axis-label')
                    .transition(400)
                    .attr('visibility', 'hidden')
                simulation.force('x', d3.forceX(function (d) {
                    return width / 2
                }))
            }
        })

        ///////////////////////
        // D3 NEW Y-AXIS
        ///////////////////////

        dropdown.y.addEventListener('change', e => {
            
            axisFilter = dropdown.y.value

            if (axisFilter !== 'disabled') {
                let scales = makeScales(axisFilter, data)

                d3.select('.y-scale')
                    .transition(400)
                    .call(d3.axisLeft(scales.y).tickSize(-(width - (padding * 4))))
                    // .attr('fill', 'rgba(0, 132, 255)')
                    .attr('stroke', 'rgba(0, 132, 255)')
                    .attr('opacity', 0.5)
                    .transition()
                    .duration(400)
                    .attr('fill', 'none')
                    .attr('stroke', 'none')
                    .attr('visibility', 'visible')

                d3.select('.y-axis-label')
                    .transition()
                    .duration(200)
                    .text(statMap[axisFilter].toUpperCase())
                    .attr('fill', 'rgba(0, 132, 255)')
                    .attr('stroke', 'rgba(0, 132, 255)')
                    .attr('stroke-width', '5px')
                    .transition()
                    .duration(200)
                    .attr('fill', 'black')
                    .attr('stroke-width', '0px')
                    .attr('visibility', 'visible')

                d3.selectAll('.circ')
                    .transition()
                    .attr('fill', (d) => { return scales.c(d[axisFilter]) })

                simulation.force('y', d3.forceY(function (d) {
                    return scales.y(d[axisFilter]) + scales.offsetScaleBandy
                }))

                simulation
                    .alphaDecay(0)
                    .alpha(0.4)
                    .restart()

                clearTimeout(init_decay);

                init_decay = setTimeout(function () {
                    console.log('init alpha decay');
                    simulation.alphaDecay(0.1);
                }, 4000);
            } else {
                d3.select('.y-scale')
                    .transition(400)
                    .attr('visibility', 'hidden')
                d3.select('.y-axis-label')
                    .transition(400)
                    .attr('visibility', 'hidden')
                simulation.force('y', d3.forceY(function (d) {
                    return height / 2
                }))
            }
        })
    })



})
