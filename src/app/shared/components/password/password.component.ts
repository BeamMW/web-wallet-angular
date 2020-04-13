import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {AbstractControl, FormControl, Validators} from '@angular/forms';
import { WindowService } from './../../../services';

export enum Colors {
  weak = '#ff5354',
  medium = '#f4ce4a',
  strong = '#00f6d2'
}


export enum Criteria {
  at_least_ten_chars,
  at_least_one_lower_case_char,
  at_least_one_upper_case_char,
  at_least_one_digit_char,
  at_least_one_special_char,
}

@Component({
  selector: 'app-password',
  templateUrl: './password.component.html',
  styleUrls: ['./password.component.scss']
})
export class PasswordComponent implements OnInit {

  @Input() password: string;

  @Input() validators: Criteria[] = Object.keys(Criteria).map(key => Criteria[key]);

  @Input() externalError: boolean;

  @Output() onStrengthChanged: EventEmitter<number> = new EventEmitter<number>();


  criteriaMap = new Map<Criteria, RegExp>();

  containAtLeastTenChars: boolean;
  containAtLeastOneLowerCaseLetter: boolean;
  containAtLeastOneUpperCaseLetter: boolean;
  containAtLeastOneDigit: boolean;
  containAtLeastOneSpecialChar: boolean;

  passwordFormControl: AbstractControl;

  private _strength: number;
  private _color: string;
  private isFullScreen = false;

  private _commonStrengthItems = Array(6);
  private _mainStrengthItems = [];

  constructor(private windowService: WindowService) {
    this.isFullScreen = this.windowService.isFullSize();

    this.criteriaMap.set(Criteria.at_least_ten_chars, RegExp(/^.{10,63}$/));
    this.criteriaMap.set(Criteria.at_least_one_lower_case_char, RegExp(/^(?=.*?[a-z])/));
    this.criteriaMap.set(Criteria.at_least_one_upper_case_char, RegExp(/^(?=.*?[A-Z])/));
    this.criteriaMap.set(Criteria.at_least_one_digit_char, RegExp(/^(?=.*?[0-9])/));
    this.criteriaMap.set(Criteria.at_least_one_special_char, RegExp(/^(?=.*?[" !"#$%&'()*+,-./:;<=>?@[\]^_`{|}~"])/));

    this.passwordFormControl = new FormControl('',
      [...this.validators.map(criteria => Validators.pattern(this.criteriaMap.get(criteria)))]);
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.password && this.password.length > 0 ?
      this.calculatePasswordStrength() : this.reset();
  }

  get strength(): number {
    return this._strength ? this._strength : 0;
  }

  get color(): string {
    if (this._strength <= 40) {
      return Colors.weak;
    } else if (this._strength === 60) {
      return Colors.medium;
    } else {
      return Colors.strong;
    }
  }

  get strengthString(): string {
    if (this._strength === 20) {
      return 'Very weak';
    } else if (this._strength === 40) {
      return 'Weak';
    } else if (this._strength === 60) {
      return 'Medium strength';
    } else if (this._strength === 100) {
      return 'Strong strength';
    } else if (this._strength === 120) {
      return 'Very strength';
    }
  }

  private _containAtLeastTenChars(): boolean {
    this.containAtLeastTenChars = this.password.length >= 10;
    return this.containAtLeastTenChars;
  }

  private _containAtLeastOneLowerCaseLetter(): boolean {
    this.containAtLeastOneLowerCaseLetter =
      this.criteriaMap
        .get(Criteria.at_least_one_lower_case_char)
        .test(this.password);
    return this.containAtLeastOneLowerCaseLetter;
  }

  private _containAtLeastOneUpperCaseLetter(): boolean {
    this.containAtLeastOneUpperCaseLetter =
      this.criteriaMap
        .get(Criteria.at_least_one_upper_case_char)
        .test(this.password);
    return this.containAtLeastOneUpperCaseLetter;
  }

  private _containAtLeastOneDigit(): boolean {
    this.containAtLeastOneDigit =
      this.criteriaMap
        .get(Criteria.at_least_one_digit_char)
        .test(this.password);
    return this.containAtLeastOneDigit;
  }

  private _containAtLeastOneSpecialChar(): boolean {
    this.containAtLeastOneSpecialChar =
      this.criteriaMap
        .get(Criteria.at_least_one_special_char)
        .test(this.password);
    return this.containAtLeastOneSpecialChar;
  }

  calculatePasswordStrength() {
    const requirements: Array<boolean> = [];
    const unit = 20;

    requirements.push(
      this._containAtLeastTenChars(),
      this._containAtLeastOneLowerCaseLetter(),
      this._containAtLeastOneUpperCaseLetter(),
      this._containAtLeastOneDigit(),
      this._containAtLeastOneSpecialChar());

    const reqLength = requirements.filter(v => v).length;
    this._strength = reqLength * unit + (reqLength > 3 ? 20 : 0);
    this.onStrengthChanged.emit(this.strength);

    this._mainStrengthItems = Array(this._strength / 20);
    this._commonStrengthItems = Array(6 - this._strength / 20);
  }


  reset() {
    this._mainStrengthItems = [];
    this._commonStrengthItems = Array(6);
    this._strength = 0;
    this.containAtLeastTenChars =
      this.containAtLeastOneLowerCaseLetter =
        this.containAtLeastOneUpperCaseLetter =
          this.containAtLeastOneDigit =
            this.containAtLeastOneSpecialChar = false;
  }
}
