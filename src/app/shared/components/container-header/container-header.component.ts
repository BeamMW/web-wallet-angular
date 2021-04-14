import { Component, OnInit, Input } from '@angular/core';
import { environment } from '@environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-container-header',
  templateUrl: './container-header.component.html',
  styleUrls: ['./container-header.component.scss']
})
export class ContainerHeaderComponent implements OnInit {
  @Input() title: string;
  @Input() subtitle: string;
  @Input() backLink: string;

  public iconArrow: string = `${environment.assetsPath}/images/shared/components/container-header/icon-back.svg`;

  constructor(
    private router: Router
  ) { }

  public backClicked() {
    if (this.backLink.length > 0) {
      this.router.navigate([this.backLink]);
    }
  }

  ngOnInit(): void {
  }

}
