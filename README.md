# Warehouse Management System

## Project Description

The Warehouse Management System is a comprehensive solution designed to streamline and automate warehouse operations. It supports businesses in efficiently managing their inventory, tracking stock levels, handling product transfers between warehouses, and maintaining supplier and customer information.

The system simplifies day-to-day warehouse workflows, reduces manual effort, and helps prevent common issues such as stockouts, overstocking, and inventory discrepancies. With built-in tools for monitoring inventory movements and setting up alerts or automated actions, it empowers warehouse managers to make informed decisions and maintain operational efficiency.

Besides these core features, the system is built with a focus on reliability, and security:

- **User Authentication & Authorization**  
  JWT-based authentication with Access and Refresh Tokens is used for securely managing user sessions, supporting short-lived access tokens for API security and long-lived refresh tokens for seamless re-authentication without requiring frequent logins. This mechanism enhances both security and user experience by limiting token lifespan while allowing session continuity.

  The system implements JWT blacklisting, which enables invalidation of tokens after logout. This approach prevents unauthorized access using previously issued tokens and adds an important security layer beyond standard stateless JWT handling.

  Each endpoint is protected using Role-Based Access Control (RBAC) to ensure users only access permitted resources.

- **Flexible RBAC (Role-Based Access Control)**  
  Roles and permissions are fully customizable per tenant, allowing fine-grained access to each feature based on business requirements.
  A user can be assigned multiple roles, and custom roles can be created to fit specific organizational needs.

- **Multi-Tenant Architecture**  
  Each store (tenant) operates in a logically isolated context, ensuring data privacy and security. The system uses a shared schema approach, where all tenants share the same database schema and tables, but their data is logically separated using a tenant identifier (e.g., tenant_id) on every relevant record.

  Tenant resolution is handled contextually based on the authenticated user's session, typically by extracting the tenant information from the JWT or request headers. All database queries are automatically scoped to the correct tenant to ensure that one tenant cannot access or affect another tenant's data.

- **Race Condition Handling**  
  The system uses transaction management and locking strategies (Row-level locking) to ensure consistent inventory values, even in high-concurrency scenarios like simultaneous import/export.

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