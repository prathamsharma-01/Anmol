# Quick Commerce Platform (Dark Store Model)

A comprehensive e-commerce platform built on microservices architecture for quick commerce operations. This platform implements the dark store model for ultra-fast delivery of products to customers.

## Architecture Overview

This platform consists of four main applications:

1. **Customer Mobile App** - Mobile application for customers to browse products, place orders, and track deliveries
2. **Seller Dashboard** - Web application for sellers to manage products, inventory, and orders
3. **Delivery App** - Mobile application for delivery personnel to manage pickups and deliveries
4. **Customer Service Dashboard** - Web application for customer service representatives to handle customer inquiries and issues

### System Architecture Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Customer App   │     │ Seller Dashboard│     │   Delivery App  │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         └───────────┬───────────┴───────────┬───────────┘
                     │                       │
            ┌────────▼────────┐     ┌────────▼────────┐
            │                 │     │Customer Service │
            └────────┬────────┘     │    Dashboard    │
                     │              └─────────────────┘
         ┌───────────┼───────────┬───────────┬───────────┐
         │           │           │           │           │
┌────────▼────┐┌─────▼─────┐┌────▼─────┐┌────▼─────┐┌────▼─────┐
│User Service ││Catalog    ││Inventory ││Order     ││Payment   │
│             ││Service    ││Service   ││Service   ││Service   │
└─────────────┘└───────────┘└──────────┘└──────────┘└──────────┘
         │           │           │           │           │
         └───────────┼───────────┼───────────┼───────────┘
                     │           │           │
            ┌────────▼────┐┌─────▼─────┐┌────▼─────┐
            │Delivery     ││Notification││Analytics │
            │Service      ││Service    ││Service   │
            └─────────────┘└───────────┘└──────────┘
                     │           │           │
         ┌───────────┼───────────┼───────────┘
         │           │           │
┌────────▼────┐┌─────▼─────┐┌────▼─────┐
│  MongoDB    ││  Redis    ││ Metrics  │
│             ││           ││          │
└─────────────┘└───────────┘└──────────┘
```

## Technology Stack

### Frontend
- **Web Applications**: React.js, Material UI, Bootstrap
- **Mobile Applications**: React Native
- **State Management**: Redux
- **API Communication**: Axios, GraphQL
- **UI/UX**: Responsive design, Progressive Web App (PWA) capabilities

### Backend
- **API Framework**: Node.js, Express.js
- **API Gateway**: Kong/Nginx
- **Authentication**: JWT, OAuth 2.0
- **Real-time Communication**: Socket.io
- **Service Communication**: REST, gRPC

### Database
- **Primary Database**: MongoDB
- **Caching**: Redis
- **Search Engine**: Elasticsearch
- **Message Queue**: RabbitMQ/Kafka

### Infrastructure
- **Containerization**: Docker
- **Orchestration**: Kubernetes
- **CI/CD**: Jenkins/GitHub Actions
- **Monitoring**: Prometheus, Grafana
- **Logging**: ELK Stack (Elasticsearch, Logstash, Kibana)

## Getting Started

### Prerequisites
- Node.js (v14+)
- Docker and Docker Compose
- MongoDB
- Redis
- Kubernetes (for production deployment)

### Installation

1. Clone the repository
```bash
git clone https://github.com/your-org/openwork-platform.git
cd openwork-platform
```

2. Install dependencies for all services
```bash
./scripts/install-all.sh
```

3. Set up environment variables
```bash
cp .env.example .env
# Edit .env file with your configuration
```

4. Start the development environment
```bash
docker-compose up
```

5. Access the applications
   - Customer App: http://localhost:3000
   - Seller Dashboard: http://localhost:3001
   - Customer Service Dashboard: http://localhost:3002
   - API Gateway: http://localhost:8000

## Project Structure

```
openwork-platform/
├── backend/
│   ├── api-gateway/          # API Gateway for routing requests to microservices
│   ├── user-service/         # User authentication and management
│   ├── catalog-service/      # Product catalog management
│   ├── inventory-service/    # Inventory tracking and management
│   ├── order-service/        # Order processing and management
│   ├── payment-service/      # Payment processing
│   ├── delivery-service/     # Delivery tracking and management
│   ├── notification-service/ # User notifications (email, SMS, push)
│   ├── analytics-service/    # Business analytics and reporting
│   └── database/             # Database schemas and migrations
├── frontend/
│   ├── customer-app/         # React Native mobile app for customers
│   ├── seller-dashboard/     # React web app for sellers
│   ├── delivery-app/         # React Native mobile app for delivery personnel
│   ├── customer-service-dashboard/ # React web app for customer service
│   └── shared/               # Shared components and utilities
├── scripts/                  # Utility scripts for development and deployment
├── kubernetes/               # Kubernetes configuration files
├── docker-compose.yml        # Docker Compose configuration for development
└── README.md                 # Project documentation
```

## Key Features

### Customer Mobile App
- User registration and authentication
- Product browsing and search
- Shopping cart and checkout
- Order tracking
- Payment integration
- Push notifications
- Delivery tracking
- Reviews and ratings

### Seller Dashboard
- Product management
- Inventory management
- Order management
- Analytics and reporting
- Promotion management
- Customer management
- Integration with delivery service

### Delivery App
- Order pickup and delivery management
- Route optimization
- Delivery status updates
- Customer communication
- Proof of delivery
- Earnings tracking

### Customer Service Dashboard
- Customer inquiry management
- Order issue resolution
- Customer communication
- Analytics and reporting
- Knowledge base management

## Development Workflow

1. **Local Development**: Use Docker Compose for local development
2. **Testing**: Run unit and integration tests before committing
3. **CI/CD**: Automated testing and deployment with GitHub Actions
4. **Staging**: Deploy to staging environment for QA
5. **Production**: Deploy to production Kubernetes cluster

## API Documentation

API documentation is available at `/api/docs` when running the development environment.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Development Roadmap

See the [ROADMAP.md](ROADMAP.md) file for the development phases and feature priorities.