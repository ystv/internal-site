"use client";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css"

export default function APIDocsPage() {
  return (
    <SwaggerUI url="/api/openapi.json" />
  );
}
