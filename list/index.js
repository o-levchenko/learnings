#!/usr/bin/end node

import { promises, readdir } from 'fs';
import { join } from 'path';
import chalk from 'chalk';

const { lstat } = promises
const targetDir = process.argv[2] || process.cwd();

readdir(targetDir, async (err, filenames) => {
    if (err) {
        console.log(err);
    }

    const statPromises = filenames.map(filename => {
        return lstat(join(targetDir, filename));
    })

    const allStats = await Promise.all(statPromises);

    for (let stats of allStats) {
        const index = allStats.indexOf(stats);

        if (stats.isFile()) {
            console.log(filenames[index]);
        } else {
            console.log(chalk.bold(filenames[index]));
        }   
    } 
});