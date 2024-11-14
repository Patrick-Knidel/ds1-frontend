"use client";
import { useState, useEffect } from "react"
import axios from 'axios';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const table = [
  {
    id: 1,
    horario: 1,
    segunda: "",
    terca: "",
    quarta: "",
    quinta: "",
    sexta: "",
  },
  {
    id: 1,
    horario: 2,
    segunda: "",
    terca: "",
    quarta: "",
    quinta: "",
    sexta: "",
  },
  {
    id: 1,
    horario: 3,
    segunda: "",
    terca: "",
    quarta: "",
    quinta: "",
    sexta: "",
  },
  {
    id: 1,
    horario: 4,
    segunda: "",
    terca: "",
    quarta: "",
    quinta: "",
    sexta: "",
  },
  {
    id: 1,
    horario: 5,
    segunda: "",
    terca: "",
    quarta: "",
    quinta: "",
    sexta: "",
  },
]

export default function Indisponibilidade() {

  const [tabela, setTabela] = useState([]);

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/Sala")
        setTabela(response.data);
        console.log("data", response.data);
      } catch (error) {
        console.log(error)
      }
    }

    getData();
  }, [])
  return (
    <main className="w-full min-h-screen">
      <div className="w-full flex font-bold text-3xl justify-center mt-4 mb-8">Indisponibilizar Sala</div>

      <div className="grid grid-cols-1 sm:grid-cols-3">
        <div className="grid ml-4 mr-4 mt-2">
          <label className="text-xl">Bloco:</label>
          <input
            placeholder="Bloco"
            className="rounded-md border p-2"
          />
        </div>

        <div className="grid ml-4 mr-4 mt-2">
          <label className="text-xl">Número:</label>
          <input
            placeholder="Número"
            className="rounded-md border p-2"
          />
        </div>
      </div>

      <div className="p-6 w-full mx-auto">
        <div className="w-full flex font-bold text-3xl justify-center mt-4 mb-8">Disciplinas Disponíveis</div>

        <div className="border rounded-lg p-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="">Id</TableHead>
                <TableHead className="">Bloco</TableHead>
                <TableHead>Número</TableHead>
                <TableHead>Capacidade Máxima</TableHead>
                <TableHead>Laboratório</TableHead>
                <TableHead>Arcondicionado</TableHead>
                <TableHead>Lousa Digital</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tabela.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.bloco}</TableCell>
                  <TableCell>{row.numero}</TableCell>
                  <TableCell>{row.capacidadeMaxima}</TableCell>
                  <TableCell>{row.possuiLaboratorio ? "Sim" : "Não"}</TableCell>
                  <TableCell>{row.possuiArCondicionado ? "Sim" : "Não"}</TableCell>
                  <TableCell>{row.possuiLousaDigital ? "Sim" : "Não"}</TableCell>
                  <TableCell>

                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div>
          <Dialog>
            <DialogTrigger>
              <button className="rounded-md bg-blue-600 text-white p-1.5 mr-2 w-[200px]">
                Salvar
              </button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Salvar</DialogTitle>
                <DialogDescription>Tem certeza que deseja salvar?</DialogDescription>
              </DialogHeader>

              <form>
                <DialogFooter>
                  <Button type="button" variant="outline">Cancelar</Button>
                  <Button type="button" >Sim</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

    </main>
  );
}