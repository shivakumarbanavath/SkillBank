const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
const dstPath = path.join(__dirname, '..', 'prisma', 'schema.postgresql.prisma');

const content = fs.readFileSync(srcPath, 'utf8');
const pgContent = content.replace('provider = "sqlite"', 'provider = "postgresql"');

fs.writeFileSync(dstPath, pgContent, 'utf8');
console.log('Successfully generated prisma/schema.postgresql.prisma');
