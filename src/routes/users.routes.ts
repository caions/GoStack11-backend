import { Router } from 'express';
import multer from 'multer';
import uploadConfig from '../config/upload';

import { CreateUserService } from '../services/CreateUserService';
import { UpdateUserAvatarService } from '../services/UpdateUserAvatarService';

import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';

const usersRouter = Router();
const upload = multer(uploadConfig);
usersRouter.post('/', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const createUserService = new CreateUserService();

    const user = await createUserService.execute({
      name,
      email,
      password,
    });

    return res.json(user);
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
});

usersRouter.patch(
  '/avatar',
  ensureAuthenticated,
  upload.single('avatar'),
  async (req, res) => {
    if (req.file) {
      try {
        const updateUserAvatarService = new UpdateUserAvatarService();
        const user = await updateUserAvatarService.execute({
          user_id: req.user.id,
          avatarFilename: req.file.filename,
        });
        return res.json({ user });
      } catch (error) {
        return res.status(404).json({ error: error.message });
      }
    } else {
      return res.status(404).json({ error: 'file undefined' });
    }
  },
);

export { usersRouter };
