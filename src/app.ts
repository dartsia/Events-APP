import path from 'path'
require('dotenv').config({ path: path.resolve(__dirname, './.env') })
import express from 'express';
import cookieParser from 'cookie-parser';
import authRouter from '../routes/authRouter';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

app.use('/auth', authRouter);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});