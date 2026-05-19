# Step 1: Build Java Backend
FROM maven:3.8.5-openjdk-17 AS backend-build
WORKDIR /app/backend
COPY docfinder-backend/pom.xml .
COPY docfinder-backend/src ./src
RUN mvn clean install -DskipTests

# Step 2: Run Java Backend
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY --from=backend-build /app/backend/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]