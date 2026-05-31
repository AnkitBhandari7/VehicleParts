# Use the official Microsoft .NET SDK image to build the project
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy csproj files and restore as distinct layers to cache dependencies
COPY ["VehicleParts.API/VehicleParts.API.csproj", "VehicleParts.API/"]
COPY ["VehicleParts.Application/VehicleParts.Application.csproj", "VehicleParts.Application/"]
COPY ["VehicleParts.Domain/VehicleParts.Domain.csproj", "VehicleParts.Domain/"]
COPY ["VehicleParts.Infrastructure/VehicleParts.Infrastructure.csproj", "VehicleParts.Infrastructure/"]
RUN dotnet restore "VehicleParts.API/VehicleParts.API.csproj"

# Copy all source files and build the release app
COPY . .
WORKDIR "/src/VehicleParts.API"
RUN dotnet build "VehicleParts.API.csproj" -c Release -o /app/build

# Publish the release application
FROM build AS publish
RUN dotnet publish "VehicleParts.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Use the lightweight ASP.NET runtime-only image
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Expose the default container port
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "VehicleParts.API.dll"]
