import type { NextApiHandler, NextApiRequest, NextApiResponse, } from "next";
import type { RespostaPadraoMsg } from "../types/RespostaPadraoMsg";
import NextCors from "nextjs-cors";


export const politicaCORS = (handler: NextApiHandler) =>
    async (req: NextApiRequest, res: NextApiResponse<RespostaPadraoMsg>) => {
        try {

            await NextCors(req, res,{
                origin: '*',
                mettods : ['GET' ,  'PUT'  ,  'POST'],
                optionsSuccessStatus : 200,
            });
            return handler(req, res);

        } catch (e) {
            console.log('Erro ao tratar a politica de Cors:', e)
            res.status(500).json({ erro: 'Erro ao tratar a politica de Cors.' })
        }
    }
