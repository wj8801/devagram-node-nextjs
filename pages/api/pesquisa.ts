import type { NextApiRequest, NextApiResponse } from "next";
import { conectarMongoDB } from "../../middlewares/conectarMongoDB";
import { UsuarioModel } from "../../models/UsuarioModel";
import { validarTokenJWT } from "../../middlewares/validarTokenJWT";
import type { RespostaPadraoMsg } from "../../types/RespostaPadraoMsg";
import { politicaCORS } from "../../middlewares/politicaCORS";

const pesquisaEndpoint
    = async (req: NextApiRequest, res: NextApiResponse<RespostaPadraoMsg | any[]>) => {

        try {
            if (req.method === 'GET') {
                if (req?.query?.id) {
                    const usuariocEncontrado = await UsuarioModel.findById(req?.query?.id);
                    if (!usuariocEncontrado){
                        return res.status(400).json({ erro: 'Usuario nao encontrado' });
                    }
                    return res.status(200).json(usuariocEncontrado);
                    
                } else {
                    const { filtro } = req.query;

                    if (!filtro || filtro.length < 2) {
                        return res.status(400).json({ erro: 'O nome precisa ter mais que dois caracteres' });

                    }
                    const usuariocEncontrados = await UsuarioModel.find({
                        nome: { $regex: filtro, $options: 'i' }
                    });
                       
                    usuariocEncontrados.forEach(e => e.senha = null);
                    return res.status(200).json(usuariocEncontrados);
                }
            }
            return res.status(500).json({ erro: 'Metodo informado nao e valido' });
        } catch (e) {
            console.log(e);
            return res.status(500).json({ erro: 'Nao e possivel busca usuario' + e });
        }
    }
export default politicaCORS(validarTokenJWT((conectarMongoDB(pesquisaEndpoint))));