import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatSelectorComponent } from './chat-selector.component';

describe('ChatSelectorComponent', () => {
  let component: ChatSelectorComponent;
  let fixture: ComponentFixture<ChatSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatSelectorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
