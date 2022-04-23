import { NextApiRequest, NextApiResponse } from 'next';
import type { RespostaPadraoMsg } from '../../types/RespostaPadraoMsg';
import { UsuarioModel } from '../../models/UsuarioModel';
import { conectarMongoDB } from '../../middlewares/conectarMongoDB';
import { validarTokenJWT } from '../../middlewares/validarTokenJWT';
import { SeguidorModel } from '../../models/SeguidorModel';
import { politicaCORS } from '../../middlewares/politicaCORS';


const seguirEndpoint
    = async (req: NextApiRequest, res: NextApiResponse<RespostaPadraoMsg | any>) => {
        try {
            if (req.method === 'PUT') {

                const { userId, id } = req?.query;
                const usuarioLogado = await UsuarioModel.findById(userId);

                if (!usuarioLogado) {
                    return res.status(400).json({ erro: 'Usuario Logado nao encontrado' });

                }
                const usuarioASerSeguido = await UsuarioModel.findById(id);
                if (!usuarioASerSeguido) {
                    return res.status(400).json({ erro: 'Usuario a ser seguido nao encontrado' });
                }

                const euJaSigoEsseUsuario = await SeguidorModel
                    .find({ usuarioId: usuarioLogado._id, usuarioSeguidoId: usuarioASerSeguido._id });
                if (euJaSigoEsseUsuario && euJaSigoEsseUsuario.length > 0) {

                    euJaSigoEsseUsuario.forEach(async (e: any) => await SeguidorModel.findByIdAndDelete({ _id: e._id }));

                    usuarioLogado.seguindo--;
                    await UsuarioModel.findByIdAndUpdate({ _id: usuarioLogado._id._id }, usuarioLogado);
                    usuarioASerSeguido.seguidores--;
                    await UsuarioModel.findByIdAndUpdate({ _id: usuarioASerSeguido._id }, usuarioASerSeguido);

                    return res.status(200).json({ erro: 'Usuario deixou de seguir com sucesso' });

                } else {

                    const seguidor = {
                        usuarioId: usuarioLogado._id,
                        usuarioSeguidoId: usuarioASerSeguido._id
                    };
                    await SeguidorModel.create(seguidor);

                    usuarioLogado.seguindo++;
                    await UsuarioModel.findByIdAndUpdate({ _id: usuarioLogado._id }, usuarioLogado);

                    usuarioASerSeguido.seguidores++;
                    await UsuarioModel.findByIdAndUpdate({ _id: usuarioASerSeguido._id }, usuarioASerSeguido);
                    return res.status(200).json({ msg: 'Usuario seguido com sucesso' });

                }
            }

            return res.status(405).json({ erro: 'Metodo informado nao existe' });

        } catch (e) {
            console.log(e);
            return res.status(500).json({ erro: 'Ocorreu um erro ao seguir/deseguir usuario informado' });
        }
    };
export default politicaCORS(validarTokenJWT(conectarMongoDB(seguirEndpoint)));