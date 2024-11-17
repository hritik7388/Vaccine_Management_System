 //v7 imports
import user from "../server/api/V1/controller/users/routes";
 import admin from './api/V1/controller/admin/routes';
 import center from './api/V1/controller/center/routes'
import statics from './api/V1/controller/static/routes';
import faq from './api/V1/controller/static/routes'; 
import supportTicket from './api/v1/controller/supportTicket/routes'; 


/**
 *
 *
 * @export
 * @param {any} app
 */

export default function routes(app) {

   app.use("/api/v1/user", user)
   app.use('/api/v1/admin', admin)
   app.use('/api/V1/center',center)
  app.use('/api/v1/static', statics)
  app.use('/api/v1/faq', faq)  
  app.use('/api/v1/supportTicket',supportTicket) 


  



  return app;
}
