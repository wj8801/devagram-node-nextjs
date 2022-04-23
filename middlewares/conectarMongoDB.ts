import type { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';
import mongoose from 'mongoose';
import type { RespostaPadraoMsg } from '../types/RespostaPadraoMsg';

export const conectarMongoDB = (handler : NextApiHandler) => 
 async (req : NextApiRequest, res : NextApiResponse<RespostaPadraoMsg | any[]>) => {

/*  verificar se o banco esta conectado, se estiver seguir 
      para o endpoit ou o proximo middleware  */
    if (mongoose.connections[0].readyState){
         return handler(req, res);
    } 
    
    // ja que nao esta conectado vamos conectar e obter a variavel de ambiente preenchida do env  
    const {DB_CONEXAO_STRING} = process.env;
     
    //  se a env estiver vazia aborta o uso do sistema e avisar o programador   
    if (!DB_CONEXAO_STRING){
        return res.status(500).json({erro: 'ENV de configuracao do banco, nao informado'});
    }
    
    mongoose.connection.on('connected', ()=> console.log('Banco de dados conectado'));
    mongoose.connection.on('error', error => console.log(`Ocorreu um erro ao conectar:${error}`));
    //  agora posso seguir para o endpoint, pois estou conectado no banco  
    await mongoose.connect(DB_CONEXAO_STRING);
    
    return handler(req, res);
};