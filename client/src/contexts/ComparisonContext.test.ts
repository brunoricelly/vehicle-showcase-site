import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { ComparisonProvider, useComparison } from "./ComparisonContext";

describe("ComparisonContext", () => {
  it("should initialize with empty selected vehicles", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ComparisonProvider>{children}</ComparisonProvider>
    );
    const { result } = renderHook(() => useComparison(), { wrapper });

    expect(result.current.selectedVehicles).toEqual([]);
  });

  it("should add a vehicle to comparison", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ComparisonProvider>{children}</ComparisonProvider>
    );
    const { result } = renderHook(() => useComparison(), { wrapper });

    const vehicle = {
      id: 1,
      brand: "BMW",
      model: "M2",
      year: 2024,
      mileage: 15000,
      price: "569900",
      category: "esportivo",
      color: "preto",
      transmission: "automatica",
      description: "Test vehicle",
      images: [],
    };

    act(() => {
      result.current.addVehicle(vehicle);
    });

    expect(result.current.selectedVehicles).toHaveLength(1);
    expect(result.current.selectedVehicles[0]).toEqual(vehicle);
  });

  it("should not add duplicate vehicles", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ComparisonProvider>{children}</ComparisonProvider>
    );
    const { result } = renderHook(() => useComparison(), { wrapper });

    const vehicle = {
      id: 1,
      brand: "BMW",
      model: "M2",
      year: 2024,
      mileage: 15000,
      price: "569900",
      category: "esportivo",
      color: "preto",
      transmission: "automatica",
      description: "Test vehicle",
      images: [],
    };

    act(() => {
      result.current.addVehicle(vehicle);
      result.current.addVehicle(vehicle);
    });

    expect(result.current.selectedVehicles).toHaveLength(1);
  });

  it("should respect the 3 vehicle limit", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ComparisonProvider>{children}</ComparisonProvider>
    );
    const { result } = renderHook(() => useComparison(), { wrapper });

    const createVehicle = (id: number) => ({
      id,
      brand: `Brand${id}`,
      model: `Model${id}`,
      year: 2024,
      mileage: 15000,
      price: "569900",
      category: "esportivo",
      color: "preto",
      transmission: "automatica",
      description: "Test vehicle",
      images: [],
    });

    act(() => {
      result.current.addVehicle(createVehicle(1));
      result.current.addVehicle(createVehicle(2));
      result.current.addVehicle(createVehicle(3));
      result.current.addVehicle(createVehicle(4)); // Should not be added
    });

    expect(result.current.selectedVehicles).toHaveLength(3);
    expect(result.current.canAddMore()).toBe(false);
  });

  it("should remove a vehicle from comparison", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ComparisonProvider>{children}</ComparisonProvider>
    );
    const { result } = renderHook(() => useComparison(), { wrapper });

    const vehicle1 = {
      id: 1,
      brand: "BMW",
      model: "M2",
      year: 2024,
      mileage: 15000,
      price: "569900",
      category: "esportivo",
      color: "preto",
      transmission: "automatica",
      description: "Test vehicle",
      images: [],
    };

    const vehicle2 = {
      id: 2,
      brand: "Maserati",
      model: "Levante",
      year: 2018,
      mileage: 24100,
      price: "564900",
      category: "suv",
      color: "azul",
      transmission: "automatica",
      description: "Test vehicle 2",
      images: [],
    };

    act(() => {
      result.current.addVehicle(vehicle1);
      result.current.addVehicle(vehicle2);
    });

    expect(result.current.selectedVehicles).toHaveLength(2);

    act(() => {
      result.current.removeVehicle(1);
    });

    expect(result.current.selectedVehicles).toHaveLength(1);
    expect(result.current.selectedVehicles[0]?.id).toBe(2);
  });

  it("should clear all vehicles from comparison", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ComparisonProvider>{children}</ComparisonProvider>
    );
    const { result } = renderHook(() => useComparison(), { wrapper });

    const createVehicle = (id: number) => ({
      id,
      brand: `Brand${id}`,
      model: `Model${id}`,
      year: 2024,
      mileage: 15000,
      price: "569900",
      category: "esportivo",
      color: "preto",
      transmission: "automatica",
      description: "Test vehicle",
      images: [],
    });

    act(() => {
      result.current.addVehicle(createVehicle(1));
      result.current.addVehicle(createVehicle(2));
    });

    expect(result.current.selectedVehicles).toHaveLength(2);

    act(() => {
      result.current.clearComparison();
    });

    expect(result.current.selectedVehicles).toHaveLength(0);
  });

  it("should check if a vehicle is selected", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ComparisonProvider>{children}</ComparisonProvider>
    );
    const { result } = renderHook(() => useComparison(), { wrapper });

    const vehicle = {
      id: 1,
      brand: "BMW",
      model: "M2",
      year: 2024,
      mileage: 15000,
      price: "569900",
      category: "esportivo",
      color: "preto",
      transmission: "automatica",
      description: "Test vehicle",
      images: [],
    };

    expect(result.current.isVehicleSelected(1)).toBe(false);

    act(() => {
      result.current.addVehicle(vehicle);
    });

    expect(result.current.isVehicleSelected(1)).toBe(true);
  });

  it("should allow adding more vehicles when under limit", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ComparisonProvider>{children}</ComparisonProvider>
    );
    const { result } = renderHook(() => useComparison(), { wrapper });

    expect(result.current.canAddMore()).toBe(true);

    const createVehicle = (id: number) => ({
      id,
      brand: `Brand${id}`,
      model: `Model${id}`,
      year: 2024,
      mileage: 15000,
      price: "569900",
      category: "esportivo",
      color: "preto",
      transmission: "automatica",
      description: "Test vehicle",
      images: [],
    });

    act(() => {
      result.current.addVehicle(createVehicle(1));
      result.current.addVehicle(createVehicle(2));
    });

    expect(result.current.canAddMore()).toBe(true);

    act(() => {
      result.current.addVehicle(createVehicle(3));
    });

    expect(result.current.canAddMore()).toBe(false);
  });
});
