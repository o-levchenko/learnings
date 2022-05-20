const { Engine, Render, Runner, Composite, World, Bodies } = Matter;

const width = 600;
const height = 600;

const engine = Engine.create();
const { world } = engine;
const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        wireframes: true,
        width, 
        height
    }
});
Render.run(render);
Runner.run(Runner.create(), engine);

// Walls
const rows = 5;
const columns = 3;

const walls = [
    Bodies.rectangle(width/2, 0, width, 40, { isStatic: true }),
    Bodies.rectangle(width / 2, height, width, 40, { isStatic: true }),
    Bodies.rectangle(0, height / 2, 40, height, { isStatic: true }),
    Bodies.rectangle(width, height / 2, 40, height, { isStatic: true })
];
Composite.add(world, walls);

const shuffle = (arr) => {
    let counter = arr.length;

    while (counter > 0) {
        const index = Math.floor(Math.random() * counter);
        
        counter--;
        
        const temp = arr[counter];
        arr[counter] = arr[index];
        arr[index] = temp;
    }

    return arr;
}


// Maze generation
const grid = Array(rows)
    .fill(null)
    .map(() => Array(columns).fill(false));

const verticals = Array(rows)
    .fill(null)
    .map(() => Array(columns - 1).fill(false));

const horizontals = Array(rows - 1)
    .fill(null)
    .map(() => Array(columns).fill(false));

const startRow = Math.floor(Math.random() * rows);
const startColumn = Math.floor(Math.random() * columns);

const stepThroughCell = (row, column) => {
    // If I have visited the call at [row, column], then return
    if (grid[row][column]) return;

    // Mark this cell as visited
    grid[row][column] = true;

    // Assemble randomly-ordered list of neighbors
    let neightbors = shuffle([
        [row - 1, column, 'up'],
        [row, column - 1, 'left'],
        [row + 1, column, 'down'],
        [row, column + 1, 'right']
    ]);
    // For each neighbor..
    for (let neighbor of neightbors) {
        const [nextRow, nextColumn, direction] = neighbor;
        // see if that neightbor is out of bounds
        if (nextRow < 0 || nextRow >= rows || nextColumn < 0 || nextColumn >= columns) {
            continue;
        }
        // see if we have visited that neighbor, continue to next neighbor
        if (grid[nextRow][nextColumn]) {
            continue;
        }

        // Remove a wall from either horizontals or verticals
        switch(direction) {
            case 'up':
                horizontals[row-1][column] = true;
                break;
            case 'down':
                horizontals[row][column] = true;
                break;
            case 'right':
                verticals[row][column] = true;
                break;
            case 'left':
                verticals[row][column - 1] = true;
                break;
        }

        // Visit that next cell
        stepThroughCell(nextRow, nextColumn);
    }

};

stepThroughCell(startRow, startColumn);
console.log(startRow, startColumn);
console.log(verticals);
console.log(horizontals);