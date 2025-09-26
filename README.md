# 🛍️ CoreKit Store

**E-commerce Frontend Application Built with Angular 19**

CoreKit Store es una aplicación de comercio electrónico moderna desarrollada con Angular 19, utilizando Angular Material para el diseño de UI y siguiendo las mejores prácticas de arquitectura frontend.

## 🚀 Características

- ✅ **Angular 19** con componentes standalone
- ✅ **Angular Material 19** con tema oscuro personalizado
- ✅ **Arquitectura modular** y escalable
- ✅ **Responsive Design** compatible con dispositivos móviles
- ✅ **Lazy Loading** para optimización de rendimiento
- ✅ **TypeScript** con configuración estricta
- ✅ **SCSS** con variables globales y sistema de theming
- ✅ **Server-Side Rendering (SSR)** habilitado

## 🏗️ Arquitectura del Proyecto

```
src/app/
├── core/                    # Servicios base y interceptors
│   ├── services/            # Servicios compartidos (API, etc.)
│   └── interceptors/        # HTTP interceptors
├── shared/                  # Componentes reusables
│   └── components/          # ProductCard, etc.
├── features/                # Módulos de funcionalidades
│   ├── home/               # Página principal
│   ├── products/           # Catálogo de productos
│   └── cart/               # Carrito de compras
├── layout/                  # Componentes de layout
│   └── components/         # Header, Footer
└── environments/           # Configuraciones de entorno
```

## 🎨 Funcionalidades Implementadas

### 📱 **UI/UX**
- Header responsive con navegación y carrito
- Footer simple y elegante
- Cards de productos con efectos hover
- Tema oscuro por defecto
- Iconografía Material Design

### 🧭 **Navegación**
- `/` - Página principal con productos destacados
- `/products` - Catálogo completo de productos
- `/cart` - Carrito de compras (estado inicial vacío)

### 🛠️ **Configuraciones**
- Environment configuration para API endpoints
- HTTP interceptor configurado para API base URL
- Path aliases configurados (@core, @shared, @features, @layout)
- Angular Material theming personalizado

## 🚀 Inicio Rápido

### Prerequisitos
- Node.js 18+ 
- npm 9+
- Angular CLI 19+

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/lodz1/corekit-store.git
cd corekit-store

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
ng serve

# La aplicación estará disponible en http://localhost:4200
```

### Scripts Disponibles

```bash
npm start          # Ejecutar servidor de desarrollo
npm run build      # Compilar para producción
npm test           # Ejecutar tests unitarios
npm run lint       # Ejecutar linter
npm run build:ssr  # Compilar con SSR
```

## 🔧 Tecnologías Utilizadas

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Angular | 19.2.x | Framework principal |
| Angular Material | 19.2.x | Biblioteca de componentes UI |
| TypeScript | 5.7.x | Lenguaje de programación |
| SCSS | - | Preprocesador CSS |
| RxJS | 7.8.x | Programación reactiva |

## 📦 Dependencias Principales

```json
{
  "@angular/core": "^19.2.0",
  "@angular/material": "^19.2.19",
  "@angular/cdk": "^19.2.19",
  "@angular/animations": "^19.2.15",
  "@angular/router": "^19.2.0",
  "@angular/common": "^19.2.0"
}
```

## 🌐 Configuración de API

La aplicación está configurada para conectarse a una API backend:

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:5000/api/v1'
};
```

## 🎯 Próximos Pasos

- [ ] Implementar servicio de productos conectado a API
- [ ] Agregar funcionalidad completa del carrito
- [ ] Implementar autenticación de usuarios
- [ ] Agregar sistema de filtros y búsqueda
- [ ] Implementar checkout y procesamiento de pagos
- [ ] Agregar testing unitario y e2e
- [ ] Optimización de rendimiento

## 🤝 Contribución

Este proyecto sigue las convenciones estándar de Angular:

1. Todos los componentes usan `templateUrl` y `styleUrls`
2. Arquitectura modular con separación clara de responsabilidades
3. Componentes standalone sin NgModules
4. TypeScript con configuración estricta
5. Convenciones de nomenclatura consistentes

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 👥 Autor

- **Desarrollador Principal** - [lodz1](https://github.com/lodz1)

---

**CoreKit Store** - Construyendo el futuro del e-commerce 🚀