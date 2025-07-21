# Warehouse Management System

## Project Description

The Warehouse Management System is designed for multi-tenant environments, allowing multiple businesses to operate independently and securely on the same infrastructure. Each tenant (store) has isolated data, ensuring complete privacy and security across the system. 

The system provides core features such as inventory tracking, warehouse transfers, product management, and supplier/customer handling.

Besides these core features, the system is built with a focus on reliability, and security:

- **User Authentication & Authorization**  
  JWT-based authentication is used to securely manage login/logout. Each endpoint is protected using Role-Based Access Control (RBAC) to ensure users only access permitted resources.

  The system implements JWT blacklisting, which enables invalidation of tokens after logout. This approach prevents unauthorized access using previously issued tokens and adds an important security layer beyond standard stateless JWT handling.

- **Flexible RBAC (Role-Based Access Control)**  
  Roles and permissions are fully customizable per tenant, allowing fine-grained access to each feature based on business requirements.
  A user can be assigned multiple roles, and custom roles can be created to fit specific organizational needs.

- **Multi-Tenant Architecture**  
  Each store operates in a logically isolated context, ensuring data privacy. Tenant resolution is handled contextually, and database queries are scoped accordingly.

- **Race Condition Handling**  
  The system uses transaction management and locking strategies to ensure consistent inventory values, even in high-concurrency scenarios like simultaneous import/export.

- **Email Alerts & Automation**  
  Admins receive email alerts for low-stock levels or critical inventory updates. Auto-reordering can be configured for essential items to ensure smooth operations.

## Technical Stack

- **TypeScript**: Used for strong typing and improved code maintainability. 

- **NestJS**: Backend framework built on top of Node.js.   

- **TypeORM**: ORM for handling database operations using TypeScript.  

- **PostgreSQL**: The primary relational database used to store all system data.  

- **Redis**: Used to store blacklisted JWT tokens for managing logout.  

- **Cloudinary**: Used for hosting and managing product images in the cloud.  

- **JWT (JSON Web Token)**: Authentication mechanism for secure API access.  

- **Nodemailer**: Used for sending email alerts, such as low-stock warnings.

## API Design

The API is organized into modular components, with each module responsible for a specific domain of the system:

- **Auth**: Handles user authentication (Login, Logout, Renew access token).  

- **Tenant**: Manages store/tenant registration.

- **User**: Manages employees and their accounts.  

- **Role**: Defines and manages roles for users within a store. 

- **Permission**: Sets detailed access rules for each role.  

- **Category**: Manages product categories to aid organization. 

- **Product**: Handles product creation, editing, stock levels, and details.  

- **Warehouse**: Manages multiple warehouse entities across locations.  

- **Warehouse Transfer**: Allows transferring inventory between warehouses.  

- **Import**: Tracks incoming stock from suppliers and updates warehouse data.  

- **Export**: Manages outbound stock, either for internal use or customer delivery.  

- **Customer**: Stores and manages customer data.  

- **Supplier**: Manages supplier information and import history.  

- **Report**: Statistics and reports on inventory, imports, exports, and costs.

Each module follows RESTful API conventions and is protected using the RBAC model to ensure only authorized users can interact with the appropriate resources.

## License

MIT License

Copyright (c) 2025 BaoDo

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.