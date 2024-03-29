import { NextApiRequest, NextApiResponse } from 'next';
import type { RespostaPadraoMsg } from '../../types/RespostaPadraoMsg';
import type { CadastroRequisicao } from '../../types/CadastroRequisicao';
import { UsuarioModel } from '../../models/UsuarioModel';
import { conectarMongoDB } from '../../middlewares/conectarMongoDB';
import md5 from 'md5';
import { updload, updloadImagemCosmic } from '../../services/uploadImagemCosmic';
import nc from 'next-connect';
import { politicaCORS } from '../../middlewares/politicaCORS';

const handler = nc()
    .use(updload.single('file'))
    .post(async (req: NextApiRequest, res: NextApiResponse<any | RespostaPadraoMsg>) => {

        const usuario = req.body as CadastroRequisicao;

        if (!usuario.nome || usuario.nome.length < 2) {
            return res.status(400).json({ erro: 'Nome invalido' });
        }

        if (!usuario.email || usuario.email.length < 4
            || !usuario.email.includes('@')
            || !usuario.email.includes('.')) {
            return res.status(400).json({ erro: 'Email invalido' });

        }

        if (!usuario.senha || usuario.senha.length < 4) {
            return res.status(400).json({ erro: 'senha invalido' });
        }

        //validacao caso ja exista um usiario com o mesmo email
        const usuarioComMesmoEmail = await UsuarioModel.find({ email: usuario.email });
        if (usuarioComMesmoEmail && usuarioComMesmoEmail.length > 0) {
            return res.status(400).json({ erro: "ja existe uma conta com o email cadastrado!" });
        }

        // enviar a imagem do multer para o cosmic
        const image = await updloadImagemCosmic(req);


        // salvar no banco de dados 
        const usuarioASerSalvo = {
            nome: usuario.nome,
            email: usuario.email,
            senha: md5(usuario.senha),
            avatar: image?.media?.url
        }
        await UsuarioModel.create(usuarioASerSalvo);
        return res.status(200).json({ msg: 'Usuario criado com sucesso' });



    });

export const config = {
    api: {
        bodyParser: false
    }
};

export default politicaCORS(conectarMongoDB(handler));
