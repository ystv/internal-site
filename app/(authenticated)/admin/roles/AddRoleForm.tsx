"use client";

import { useState } from "react";
import { Button, Modal } from "@mantine/core";
import { addRole } from "./rolesActions";
import { AddOrEdit, AddOrEditRoleForm } from "@/components/RoleForm";

export function AddRoleView() {
  const [isAddOpen, setAddOpen] = useState(false);
  return (
    <>
      <div className={"mx-auto text-right"}>
        <Button onClick={() => setAddOpen(true)}>Add Role</Button>
        <br />
      </div>
      <Modal opened={isAddOpen} onClose={() => setAddOpen(false)} size={"95%"}>
        <AddOrEditRoleForm
          action={async (form) => addRole(form)}
          onSuccess={() => setAddOpen(false)}
          role={null}
          addOrEdit={AddOrEdit.Add}
        />
        <br />
      </Modal>
    </>
  );
}
