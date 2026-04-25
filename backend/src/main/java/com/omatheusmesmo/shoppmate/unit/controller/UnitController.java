package com.omatheusmesmo.shoppmate.unit.controller;

import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;

import com.omatheusmesmo.shoppmate.unit.entity.Unit;
import com.omatheusmesmo.shoppmate.unit.service.UnitService;
import com.omatheusmesmo.shoppmate.utils.HttpResponseUtil;

@RestController
@RequestMapping("/unit")
public class UnitController {

    private final UnitService unitService;

    public UnitController(UnitService unitService) {
        this.unitService = unitService;
    }

    @Operation(summary = "Return all units")
    @GetMapping
    public ResponseEntity<List<Unit>> getAllUnits() {
        try {
            List<Unit> units = unitService.findAll();
            return HttpResponseUtil.ok(units);
        } catch (Exception e) {
            return HttpResponseUtil.internalServerError();
        }
    }

    @Operation(summary = "Add a new unit")
    @PostMapping
    public ResponseEntity<Unit> addUnit(@RequestBody Unit unit) {
        try {
            Unit addedUnit = unitService.saveUnit(unit);
            return HttpResponseUtil.created(addedUnit);
        } catch (IllegalArgumentException e) {
            return HttpResponseUtil.badRequest(unit);
        }
    }

    @Operation(summary = "Delete a unit by id")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUnit(@PathVariable Long id) {
        try {
            unitService.removeUnitById(id);
            return HttpResponseUtil.noContent();
        } catch (NoSuchElementException exception) {
            return HttpResponseUtil.notFound();
        }
    }

    @Operation(summary = "Update a unit")
    @PutMapping
    public ResponseEntity<Unit> updateUnit(@RequestBody Unit unit) {
        try {
            unitService.editUnit(unit);
            return HttpResponseUtil.ok(unit);
        } catch (NoSuchElementException noSuchElementException) {
            return HttpResponseUtil.notFound();
        } catch (IllegalArgumentException illegalArgumentException) {
            return HttpResponseUtil.badRequest(unit);
        }
    }
}
