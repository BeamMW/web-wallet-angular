import { TestBed } from '@angular/core/testing';

import { WasmService } from './wasm.service';

describe('WasmService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: WasmService = TestBed.get(WasmService);
    expect(service).toBeTruthy();
  });
});
