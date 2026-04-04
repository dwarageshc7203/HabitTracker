FROM openjdk:17-jdk-slim

WORKDIR /app

COPY . .

RUN chmod +x mvnw
RUN ./mvnw -DskipTests package

CMD ["java", "-jar", "target/HabitTracker_Backend-0.0.1-SNAPSHOT.jar"]