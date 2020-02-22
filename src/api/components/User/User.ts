import { Response, Request } from "express";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../../middlewares/authenticateDefinition';
import { SECRET_KEY } from '../../../utils/global-config.json';
import {getUsers, addUser, getUser} from './User.Services';

//Search users
export const GET = (req: AuthRequest,res: Response): void => {
    getUsers(req.query.name).then(r => 
        res.status(200).json(r.rows)
    )
    .catch(e =>
        res.status(500).json(e)
    )
}

//Register
export const POST = async (req: Request,res: Response): Promise<void> => {
    const { name, email, password } = req.body;
    const salt = await bcrypt.genSalt();
    const _password = await bcrypt.hash(password,salt);

    addUser(name,email,_password).then(r => 
        res.status(200).json(r.rows)
    )
    .catch(e =>
        res.status(500).json(e)
    )
}

//Login
export const LOGIN = async (req: Request,res: Response): Promise<void> => {
    const { email, password } = req.body;

    getUser(email).then(r => {
            if(r.rows.length>0){
                bcrypt.compare(password, r.rows[0].password).then(match => {

                    //Send authentication token
                    if(match){
                        const token = jwt.sign({id: r.rows[0].id}, SECRET_KEY)
                        res.header('Authorization', token)
                        .status(200).json({
                            id: r.rows[0].id,
                            email: r.rows[0].email,
                            password: r.rows[0].password
                        })
                    }
                    else
                        res.status(401).send('Incorrect credentials');

                });
            }
            else
                res.status(404).send('Incorrect credentials');
        }
    )
    .catch(e =>
        res.status(500).json(e)
    )
}

// /api/user PUT method
export const PUT = (req: Request,res: Response): void => {
    res.status(405).send('Method not allowed.');
}

// /api/user DELETE method
export const DELETE = (req: Request,res: Response): void => {
    res.status(405).send('Method not allowed.');
}