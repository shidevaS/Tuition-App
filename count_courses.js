const {PrismaClient} = require('@prisma/client');
const c = new PrismaClient();
c.course.count({where: {isPublished: true}}).then(r => console.log('Published courses:', r)).then(() => c.$disconnect()).catch(e => { console.error(e); c.$disconnect(); });