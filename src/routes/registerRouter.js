import { registerControler } from '../controllers/registerControler.js'
import router from './loginRouter.js'

router.get('/register', (req, res) => {
  res.render('register')
})

router.post('/register', registerControler)

export default router;