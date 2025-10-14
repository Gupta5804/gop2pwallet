**production file is much leaner and makes three critical changes**:

*No volumes*: In production, you never mount your local source code into the container. The code should be baked into the image when you build it. Removing the volumes ensures you are running the exact code that was built.

*Uses Dockerfile*: The frontend service is explicitly told to use the standard Dockerfile, which builds the app and serves it with Nginx.

Release Mode & Secrets: The user-service is set to release mode for better performance, and we've changed the JWT_SECRET to be loaded from an environment variable on the host machine (${JWT_SECRET}). This is far more secure than hardcoding secrets.

Standard Port: The frontend is mapped to port 80, which is the default for web traffic.

## How to Run Each Environment
Now you have two distinct ways to run your application.

To Run in DEVELOPMENT Mode 👩‍💻
(With live reloading)

You use the default docker-compose.yml file.



# This command automatically finds 'docker-compose.yml'
docker-compose up --build
To Run in PRODUCTION Mode 🚀
(Simulating a real deployment)

You tell Docker Compose to merge both files, with the prod file overriding the base file.

# The -f flag lets you specify which files to use, in order
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build