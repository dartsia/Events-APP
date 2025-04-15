import path from 'path'
require('dotenv').config({ path: path.resolve(__dirname, './.env') })
import express from 'express';
import cookieParser from 'cookie-parser';
import verifyJWT from '../middleware/verifyJWT';
import authRouter from '../routes/authRouter';
import eventRouter from '../routes/eventRouter';
import registerRouter from '../routes/registerForEventRouter';

import swaggerUI from 'swagger-ui-express';
import YAML from 'yamljs';

const swaggerDoc = YAML.load(path.join(__dirname, '../swagger.yaml'));

const app = express();
const PORT = process.env.PORT || 3000;

app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDoc))
app.use(express.json());
app.use(cookieParser());

app.use('/auth', authRouter);
app.use('/', eventRouter);

app.use(verifyJWT);
app.use('/participate', registerRouter);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});