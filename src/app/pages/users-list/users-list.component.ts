import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { from } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { ResponseAPI } from 'src/app/shared/response.model';
import { User } from './users.model';
import { UsersService } from './users.service';

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class UsersListComponent implements OnInit {

  loading = false;
  userDialog: boolean = false;

  filter: string = "";

  users: User[] = [];

  user: User = new User();

  selectedUsers: User[] = [];

  constructor(private messageService: MessageService, private confirmationService: ConfirmationService, private userService: UsersService) { }

  ngOnInit() {
    this.list();
  }

  list() {
    this.loading = true;
    this.userService.list().subscribe(response => {
      this.users = (response as ResponseAPI).data as User[] || [];
      this.loading = false;
    });
  }

  openNew() {
    this.user = new User();
    this.userDialog = true;
  }

  deleteSelectedUsers() {
    this.confirmationService.confirm({
      message: 'Você tem certeza que deseja excluir os usuários selecionados?',
      header: 'Atenção',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        from(this.selectedUsers).pipe(
          switchMap((value) => this.userService.delete(value.guid)),
          tap(() => this.selectedUsers = [])
        ).subscribe((response) => {
          this.getMessage((response as ResponseAPI).code);
        });
      }
    });
  }

  editUser(user: User) {
    this.user = { ...user, document: user.document!.replace("-", "").replace(/\./g, "") };
    this.userDialog = true;
  }

  deleteUser(user: User) {
    this.confirmationService.confirm({
      message: 'Você tem certeza que deseja excluir o usuário: ' + user.name + '?',
      header: 'Atenção',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.userService.delete(user.guid).subscribe(response => {
          this.getMessage((response as ResponseAPI).code);
        });
      }
    });
  }

  hideDialog() {
    this.userDialog = false;
  }

  saveUser() {
    if (this.users.filter(s => s.guid == this.user?.guid).length == 0)
      this.userService.add({ ...this.user, document: this.user?.document.replace("-", "").replace(/\./g, "")}).subscribe(response => {
        this.getMessage((response as ResponseAPI).code);
      }, () => this.getMessage(404));
    else
      this.userService.update({ ...this.user, document: this.user?.document.replace("-", "").replace(/\./g, "") }, this.user.guid).subscribe(response => {
        this.getMessage((response as ResponseAPI).code);
      }, () => this.getMessage(404));
    this.userDialog = false;
    this.user = new User();
  }

  getMessage(code: number) {
    if (code == 200) {
      this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Operação realizada!', life: 3000 });
      this.list();
    } else
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Operação não realizada!', life: 3000 });
  }

  clean(dt: any){
    this.filter = '';
    dt.filterGlobal(this.filter, 'contains');
  }
}
