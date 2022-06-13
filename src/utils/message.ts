interface activitiesInterface{
  title: string;
  date: string;
  matter?: string;
  status?: string;
}

export function getMessage(chores: activitiesInterface[]): string{
  let message: string = '\nSIGAA\n';
  message = message.concat('------------------------------------------------');

  for (let i = 0; i < chores.length; i++) {
    const todo = chores[i];
    const sequential = i + 1;

    if(todo.matter){
      message = message.concat(`\n${sequential}. ${todo.matter}`);
      message = message.concat(`\n${todo.date}`);
      message = message.concat(`\n${todo.title}`);
      message = message.concat(`\n(${todo.status})\n`);
    }else{
      message = message.concat(`\n${sequential}. ${todo.title}`);
      message = message.concat(`\n${todo.date}\n`);
    }
  }

  message = message.concat('------------------------------------------------')

  return message;
}
