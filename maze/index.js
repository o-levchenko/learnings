const { Engine, Render, Runner, Composite, World, Bodies, Body, Events } = Matter;

const width = 600;
const height = 600;

const rows = 6;
const columns = rows * width / height;

const cellWidth = width / columns;
const cellHeight = height / rows

const engine = Engine.create();
engine.world.gravity.y = 0;
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

const walls = [
    Bodies.rectangle(width / 2, 0, width, 10, { isStatic: true }),
    Bodies.rectangle(width / 2, height, width, 10, { isStatic: true }),
    Bodies.rectangle(0, height / 2, 10, height, { isStatic: true }),
    Bodies.rectangle(width, height / 2, 10, height, { isStatic: true })
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

horizontals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if (open) {
            return;
        }
        const wall = Bodies.rectangle(
            columnIndex * cellWidth + cellWidth / 2 ,  
            rowIndex * cellHeight + cellHeight,
            cellWidth,
            10,
            {
                label: 'wall',
                isStatic: true
            }
        );
        Composite.add(world, wall);
    })
});

verticals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if (open) {
            return;
        }
        const wall = Bodies.rectangle(
            columnIndex * cellWidth + cellWidth,
            rowIndex * cellHeight + cellHeight / 2,
            10,
            cellHeight,
            {
                label: 'wall',
                isStatic: true
            }
        );
        Composite.add(world, wall);
    });
});

// Goal

const goal = Bodies.rectangle(
    width - cellWidth / 2,
    height - cellHeight / 2,
    cellWidth * .7,
    cellHeight * .7,
    {
        label: 'goal',
        isStatic: true
    }
);
Composite.add(world, goal);

// Ball

const ball = Bodies.circle(
    cellWidth / 2,
    cellHeight / 2,
    cellWidth / 4, 
    {
        label: 'goal'
    }
);
Composite.add(world, ball)


// Move ball controls

document.addEventListener('keydown', event => {
    const { x, y } = ball.velocity;
    console.log(x, y);

    if (event.keyCode === 87) {
        console.log('move ball up');
        Body.setVelocity(ball, {x, y: y - 5});
    }

    if (event.keyCode === 68) {
        console.log('move ball right');
        Body.setVelocity(ball, {x: x + 5, y});
    }

    if (event.keyCode === 83) {
        Body.setVelocity(ball, {x, y: y + 5});
    }

    if (event.keyCode === 65) {
        Body.setVelocity(ball, {x: x - 5, y});
    }
});

// Wind Condition

Events.on(engine, 'collisionStart', event => {
    event.pairs.forEach(collision => {
        const labels = ['ball', 'goal'];

        if (
            labels.includes(collision.bodyA.label) &&
            labels.includes(collision.bodyB.label)
        ) {
            world.gravity.y = 1;
            world.bodies.forEach(body => {
                if (body.label === 'wall') {
                    Body.setStatic(body, false);
                }
            })
        }
    });
});