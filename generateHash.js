const bcrypt = require('bcrypt');

async function generateHash(password) {
    const saltRounds = 10; // Same as in your userController.js
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log(`Original Password: ${password}`);
    console.log(`Hashed Password: ${hashedPassword}`);
}

// Replace 'enterPasswordHere' with the desired password for your admin user
generateHash('123456');