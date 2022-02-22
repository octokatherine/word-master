import isAlpha from 'validator/lib/isAlpha';
import isLength from 'validator/lib/isLength';
import words from '../data/words';

const validateWordle = (wordle: string) => {
    let errors = [];

    if (!isAlpha(wordle)) {
        errors.push('No special characters.');
    }

    if (!isLength(wordle, { min: 5, max: 5 })) {
        errors.push('Must be exactly 5 letters.');
    }

    if (!words[wordle]) {
        errors.push('Not in current word list.');
    }
    
    // return [{ message: 'Wordle cannot contain special characters' }];
    return errors;
}

export {
    validateWordle,
}